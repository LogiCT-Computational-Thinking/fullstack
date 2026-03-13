"""
evaluation/runner.py
─────────────────────
Orchestrates the full RAG evaluation pipeline:

  1. Retrieval metrics   (Precision@K, Recall@K, MeanSim, Coverage, Diversity)
  2. /chat API call      → get LLM reply
  3. Faithfulness        (keyword + embedding)
  4. Hallucination risk
  5. /evaluate API call  → Answer Quality (boolean)
  6. Offline stats       (from historical JSON logs)
  7. Save results        (JSON + CSV + TXT report)

── LOCAL OLLAMA MODE ─────────────────────────────────────────────────────────
This evaluator is intentionally wired to a LOCAL Ollama instance instead of a
remote API.  Reason: remote free-tier tokens (e.g. ChatAnywhere) flag automated
sequential requests as bot traffic and ban the token.

Set these environment variables (or edit the defaults below) to match your
local Ollama setup:

  OLLAMA_BASE_URL      default: http://localhost:11434
  OLLAMA_CHAT_MODEL    default: same model as the main app (from .env CHAT_MODEL)
                                falls back to "llama3"
  OLLAMA_EMBED_MODEL   default: "nomic-embed-text"
                                (pull with: ollama pull nomic-embed-text)

Human-like pacing is applied between requests to avoid any rate-limiting even
on local servers: a randomised delay (PACE_MIN … PACE_MAX seconds) is inserted
after every API call, plus a longer "thinking pause" between test cases.
──────────────────────────────────────────────────────────────────────────────
"""

import csv
import json
import logging
import os
import random
import statistics
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import requests

from evaluation.faithfulness import detect_hallucination, evaluate_faithfulness
from evaluation.metrics import (
    cosine_similarity,
    coverage_score,
    mean_similarity,
    precision_at_k,
    recall_at_k,
    source_diversity,
)
from evaluation.test_cases import TEST_CASES

logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────
BASE_URL            = os.getenv("EVAL_BASE_URL",   "http://127.0.0.1:8000")
TOP_K               = 4
RELEVANCE_THRESHOLD = 0.30
COVERAGE_THRESHOLD  = 0.25

# ── Ollama local LLM settings ───────────────────────────────────────────────
# The evaluator calls Ollama directly — no remote token involved.
OLLAMA_BASE_URL    = os.getenv("OLLAMA_BASE_URL",   "http://localhost:11434")
OLLAMA_CHAT_MODEL  = os.getenv("OLLAMA_CHAT_MODEL",
                                os.getenv("CHAT_MODEL", "llama3"))
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# ── Human-like pacing ───────────────────────────────────────────────────────
# Randomised delays simulate a real student reading & typing between questions.
# Adjust these if your machine is slow or if you want faster runs.
PACE_MIN          = float(os.getenv("PACE_MIN", "2.5"))   # min seconds between calls
PACE_MAX          = float(os.getenv("PACE_MAX", "5.5"))   # max seconds between calls
THINK_PAUSE_MIN   = float(os.getenv("THINK_PAUSE_MIN", "4.0"))   # pause between test cases
THINK_PAUSE_MAX   = float(os.getenv("THINK_PAUSE_MAX", "8.0"))


def _human_pause(label: str = "") -> None:
    """Sleep a random human-like interval and log it."""
    delay = round(random.uniform(PACE_MIN, PACE_MAX), 2)
    logger.debug("  ⏳ pacing %ss %s", delay, label)
    time.sleep(delay)


def _think_pause() -> None:
    """Longer pause between test cases — like a student switching topics."""
    delay = round(random.uniform(THINK_PAUSE_MIN, THINK_PAUSE_MAX), 2)
    logger.debug("  💭 thinking pause %ss", delay)
    time.sleep(delay)


# ── Ollama embedding ────────────────────────────────────────────────────────

def _get_embedding(text: str) -> Optional[np.ndarray]:
    """
    Get a text embedding from the local Ollama /api/embeddings endpoint.
    Uses nomic-embed-text (or OLLAMA_EMBED_MODEL) — fully local, no token needed.
    """
    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/embeddings",
            json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
            timeout=30,
        )
        resp.raise_for_status()
        vec = np.array(resp.json()["embedding"], dtype="float32")
        norm = np.linalg.norm(vec)
        if norm:
            vec /= norm
        return vec
    except Exception as exc:
        logger.warning("Ollama embedding error: %s", exc)
        return None


def _get_emb_list(text: str) -> Optional[List[float]]:
    emb = _get_embedding(text)
    return emb.tolist() if emb is not None else None


# ── Ollama chat (used for answer-quality evaluation) ────────────────────────

def _ollama_chat(prompt: str) -> Optional[str]:
    """
    Send a single-turn prompt to the local Ollama instance.

    Strategy: try /api/generate first (works on all Ollama versions), then
    fall back to /api/chat (works on Ollama >= 0.1.14 when the model supports
    the messages format).  The /api/chat 500 error usually means the loaded
    model variant does not support the chat template — /api/generate always
    works regardless of model or version.
    """
    _human_pause("before ollama generate")

    # ── Primary: /api/generate ───────────────────────────────────────────
    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_CHAT_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=180,
        )
        resp.raise_for_status()
        data = resp.json()
        # /api/generate returns {"response": "..."}
        text = data.get("response", "").strip()
        if text:
            return text
        logger.warning("Ollama /api/generate returned empty response: %s", data)
    except Exception as exc:
        logger.warning("Ollama /api/generate failed (%s), trying /api/chat…", exc)

    # ── Fallback: /api/chat ───────────────────────────────────────────────
    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_CHAT_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
            timeout=180,
        )
        resp.raise_for_status()
        data = resp.json()
        # /api/chat returns {"message": {"role": "assistant", "content": "..."}}
        text = data.get("message", {}).get("content", "").strip()
        if text:
            return text
        logger.warning("Ollama /api/chat returned empty response: %s", data)
    except Exception as exc:
        logger.error(
            "Ollama chat error on both endpoints for model '%s' @ %s: %s\n"
            "  → Check: ollama list  (is the model name correct?)\n"
            "  → Check: ollama serve (is Ollama running?)",
            OLLAMA_CHAT_MODEL, OLLAMA_BASE_URL, exc,
        )

    return None


# ── App API helpers ────────────────────────────────────────────────────────
# These call the running FastAPI server (which uses the configured LLM/RAG).
# Human-like pacing is applied before each call.

def _call_chat(message: str, cognitive: str, session_id: str) -> Optional[Dict]:
    """Call the app's /chat endpoint with a human-like delay before sending."""
    _human_pause("before /chat")
    try:
        resp = requests.post(
            f"{BASE_URL}/chat",
            json={"message": message, "cognitive": cognitive, "session_id": session_id},
            timeout=120,
        )
        return resp.json() if resp.status_code == 200 else None
    except Exception as exc:
        logger.error("/chat error: %s", exc)
        return None


def _evaluate_answer_locally(
    answer: str,
    correct_answer: str,
    active_question: str,
) -> Optional[Dict]:
    """
    Evaluate answer quality using the LOCAL Ollama model — NOT the remote API.

    This replaces the /evaluate endpoint call in the eval loop to avoid
    hitting the remote token limit with automated requests.
    The prompt mirrors the strict two-step evaluation used in tutor.py.
    """
    prompt = f"""Kamu adalah penilai jawaban yang ketat dan objektif.

PERTANYAAN:
{active_question}

KUNCI JAWABAN / KONTEKS:
{correct_answer[:600]}

JAWABAN YANG DIEVALUASI:
{answer}

TUGAS:
1. Periksa apakah jawaban mencakup konsep utama dari kunci jawaban.
2. Untuk soal numerik: verifikasi hasil akhir secara matematis.
3. Jangan tolak jawaban benar hanya karena singkat.

Tulis penjelasan singkat (1-2 kalimat), lalu pada baris terakhir tulis TEPAT salah satu:
HASIL: BENAR
HASIL: SALAH"""

    raw = _ollama_chat(prompt)
    if raw is None:
        return None

    import re
    match = re.search(r"HASIL:\s*(BENAR|SALAH)", raw, re.IGNORECASE)
    is_correct = match.group(1).upper() == "BENAR" if match else False
    reasoning = re.sub(r"HASIL:\s*(BENAR|SALAH)", "", raw, flags=re.IGNORECASE).strip()

    return {
        "is_correct": is_correct,
        "feedback": reasoning,
        "hint_level": "Evaluasi Lokal (Ollama)",
        "followup_question": "",
        "evaluated_by": f"ollama/{OLLAMA_CHAT_MODEL}",
    }


# ── Retrieval evaluation (Ollama embedding proxy) ─────────────────────────

def _eval_retrieval(query: str, keywords: List[str], k: int = TOP_K) -> Dict:
    q_emb = _get_embedding(query)
    if q_emb is None:
        return {"error": "Failed to embed query — is Ollama running? Check OLLAMA_BASE_URL."}

    kw_embs = [(kw, _get_embedding(kw)) for kw in keywords]
    kw_embs = [(kw, e) for kw, e in kw_embs if e is not None]
    if not kw_embs:
        return {"error": "Failed to embed keywords"}

    scored = sorted(
        [{"keyword": kw, "score": cosine_similarity(q_emb, e)} for kw, e in kw_embs],
        key=lambda x: x["score"],
        reverse=True,
    )
    top_scores  = [s["score"] for s in scored[:k]]
    top_sources = [s["keyword"] for s in scored[:k]]

    return {
        "query_embedding_dim": len(q_emb),
        "top_k_scores":        [round(s, 4) for s in top_scores],
        "top_k_keywords":      top_sources,
        "precision_at_k":      round(precision_at_k(top_scores, k, RELEVANCE_THRESHOLD), 4),
        "recall_at_k":         round(recall_at_k(top_scores, len(keywords), k, RELEVANCE_THRESHOLD), 4),
        "mean_similarity":     round(mean_similarity(top_scores), 4),
        "coverage":            round(coverage_score(top_scores, COVERAGE_THRESHOLD), 4),
        "source_diversity":    round(source_diversity(top_sources), 4),
        "detail_scores":       [{"keyword": s["keyword"], "score": round(s["score"], 4)} for s in scored],
    }


# ── Main runner ───────────────────────────────────────────────────────────

def run_evaluation() -> List[Dict]:
    print("\n" + "=" * 70)
    print("  CSIPBLLM — RAG EVALUATION SUITE")
    print(f"  {len(TEST_CASES)} test cases | Top-K={TOP_K}")
    print(f"  LLM (eval): ollama/{OLLAMA_CHAT_MODEL} @ {OLLAMA_BASE_URL}")
    print(f"  Embed:      ollama/{OLLAMA_EMBED_MODEL}")
    print(f"  App server: {BASE_URL}")
    print(f"  Pacing:     {PACE_MIN}–{PACE_MAX}s per call, {THINK_PAUSE_MIN}–{THINK_PAUSE_MAX}s between cases")
    print(f"  Start:      {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")

    results: List[Dict] = []

    for idx, tc in enumerate(TEST_CASES, 1):
        print(f"[{idx:02d}/{len(TEST_CASES)}] {tc['query'][:65]}…")
        print(f"          Cognitive: {tc['cognitive']} | Context: {tc.get('context_note', '')}")
        result: Dict[str, Any] = {
            "test_id":      idx,
            "query":        tc["query"],
            "cognitive":    tc["cognitive"],
            "context_note": tc.get("context_note", ""),
            "query_type":   tc.get("query_type", ""),
            "timestamp":    datetime.now().isoformat(),
        }

        # Step 1 — Retrieval metrics (local Ollama embeddings)
        print("  [1] Retrieval embedding (Ollama)…")
        result["retrieval"] = _eval_retrieval(tc["query"], tc["relevant_keywords"])
        if "precision_at_k" in result["retrieval"]:
            r = result["retrieval"]
            print(f"      P@{TOP_K}={r['precision_at_k']:.3f}  "
                  f"R@{TOP_K}={r['recall_at_k']:.3f}  "
                  f"MeanSim={r['mean_similarity']:.3f}  "
                  f"Cov={r['coverage']:.3f}")
        elif "error" in result["retrieval"]:
            print(f"      ⚠️  {result['retrieval']['error']}")

        # Step 2 — /chat (app server, with pacing built into _call_chat)
        print("  [2] Calling /chat (app server)…")
        chat = _call_chat(tc["query"], tc["cognitive"], tc["session_id"])
        result["chat_response"] = chat

        if chat and "reply" in chat:
            reply    = chat["reply"]
            followup = chat.get("followup_question", "")
            result["llm_reply"]         = reply[:400]
            result["followup_question"] = followup

            # Simulated context: keywords + their role in CT
            sim_ctx = [
                f"{kw} adalah konsep penting dalam computational thinking"
                for kw in tc["relevant_keywords"]
            ]

            # Step 3 — Faithfulness (Ollama embeddings)
            print("  [3] Faithfulness (Ollama embed)…")
            _human_pause("before faithfulness embed")
            faith = evaluate_faithfulness(reply, sim_ctx, _get_emb_list)
            result["faithfulness"] = faith
            print(f"      score={faith['faithfulness_score']:.3f} ({faith['method']})")

            # Step 4 — Hallucination detection
            print("  [4] Hallucination detection…")
            hall = detect_hallucination(reply, sim_ctx, tc["query"], _get_emb_list)
            result["hallucination"] = hall
            print(f"      risk={hall['hallucination_risk']:.3f} [{hall['risk_label']}]")

            # Step 5 — Answer quality via LOCAL Ollama (no remote token!)
            print(f"  [5] Answer quality (ollama/{OLLAMA_CHAT_MODEL})…")
            eval_resp = _evaluate_answer_locally(
                answer=tc["reference_answer"],
                correct_answer=reply,
                active_question=tc["query"],
            )
            result["answer_quality"] = eval_resp
            if eval_resp:
                correct = eval_resp.get("is_correct", False)
                result["answer_correct"] = correct
                print(f"      {'✅ BENAR' if correct else '❌ SALAH'}")
            else:
                result["answer_correct"] = None
                print("      ⚠️  Ollama eval unavailable")

        else:
            print("  ⚠️  /chat unavailable — is the app server running?")
            result.update(llm_reply=None, faithfulness=None, hallucination=None, answer_correct=None)

        results.append(result)
        print()

        # Human-like "thinking pause" between test cases (except after the last one)
        if idx < len(TEST_CASES):
            _think_pause()

    return results


# ── Aggregation ───────────────────────────────────────────────────────────

def compute_aggregates(results: List[Dict]) -> Dict:
    def avg(lst):
        return round(sum(lst) / len(lst), 4) if lst else None

    prec, rec, ms, cov, div, faith, hall, correct = [], [], [], [], [], [], [], []

    for r in results:
        ret = r.get("retrieval", {})
        if "precision_at_k" in ret:
            prec.append(ret["precision_at_k"])
            rec.append(ret["recall_at_k"])
            ms.append(ret["mean_similarity"])
            cov.append(ret["coverage"])
            div.append(ret["source_diversity"])
        f = r.get("faithfulness") or {}
        if "faithfulness_score" in f:
            faith.append(f["faithfulness_score"])
        h = r.get("hallucination") or {}
        if "hallucination_risk" in h:
            hall.append(h["hallucination_risk"])
        if r.get("answer_correct") is not None:
            correct.append(1 if r["answer_correct"] else 0)

    return {
        "n_tested": len(results),
        "retrieval": {
            "avg_precision_at_k":    avg(prec),
            "avg_recall_at_k":       avg(rec),
            "avg_mean_similarity":   avg(ms),
            "avg_coverage":          avg(cov),
            "avg_source_diversity":  avg(div),
        },
        "generation": {
            "avg_faithfulness":       avg(faith),
            "avg_hallucination_risk": avg(hall),
        },
        "answer_quality": {
            "total_evaluated": len(correct),
            "correct":         sum(correct),
            "incorrect":       len(correct) - sum(correct),
            "accuracy":        avg(correct),
        },
    }


def run_offline_analysis(json_path: str) -> Dict:
    if not os.path.exists(json_path):
        return {"error": f"File not found: {json_path}"}
    with open(json_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    entries = data if isinstance(data, list) else data.get("history", [])
    if not entries:
        return {"error": "Empty history file"}

    cog_dist: Dict[str, int] = {}
    reply_lengths: List[int] = []
    sessions: Dict[str, int] = {}
    followup_count = 0

    for e in entries:
        cog = e.get("cognitive", "unknown")
        cog_dist[cog] = cog_dist.get(cog, 0) + 1
        if e.get("reply"):
            reply_lengths.append(len(e["reply"]))
        sess = e.get("session_id", "default")
        sessions[sess] = sessions.get(sess, 0) + 1
        if e.get("followup_question"):
            followup_count += 1

    total = len(entries)
    return {
        "total_interactions":      total,
        "unique_sessions":         len(sessions),
        "avg_queries_per_session": round(total / max(len(sessions), 1), 2),
        "cognitive_distribution":  cog_dist,
        "avg_reply_length_chars":  round(statistics.mean(reply_lengths), 1) if reply_lengths else 0,
        "median_reply_length":     round(statistics.median(reply_lengths), 1) if reply_lengths else 0,
        "stdev_reply_length":      round(statistics.stdev(reply_lengths), 1) if len(reply_lengths) > 1 else 0,
        "followup_rate":           round(followup_count / max(total, 1), 4),
        "sessions_detail":         sessions,
    }


# ── Persistence ───────────────────────────────────────────────────────────

def save_results(
    results: List[Dict],
    aggregate: Dict,
    offline: Dict,
    out_dir: str,
) -> Tuple[str, str, str]:
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    # JSON
    json_path = os.path.join(out_dir, f"rag_eval_{ts}.json")
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(
            {"aggregate": aggregate, "offline_stats": offline, "individual_results": results},
            fh, indent=2, ensure_ascii=False,
        )

    # CSV summary
    csv_path = os.path.join(out_dir, f"rag_eval_{ts}.csv")
    fields = [
        "test_id", "query", "cognitive",
        "precision_at_k", "recall_at_k", "mean_similarity", "coverage", "source_diversity",
        "faithfulness_score", "hallucination_risk", "risk_label", "answer_correct",
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for r in results:
            ret   = r.get("retrieval", {})
            faith = r.get("faithfulness") or {}
            hall  = r.get("hallucination") or {}
            writer.writerow({
                "test_id":           r["test_id"],
                "query":             r["query"][:80],
                "cognitive":         r["cognitive"],
                "precision_at_k":    ret.get("precision_at_k", ""),
                "recall_at_k":       ret.get("recall_at_k", ""),
                "mean_similarity":   ret.get("mean_similarity", ""),
                "coverage":          ret.get("coverage", ""),
                "source_diversity":  ret.get("source_diversity", ""),
                "faithfulness_score":faith.get("faithfulness_score", ""),
                "hallucination_risk":hall.get("hallucination_risk", ""),
                "risk_label":        hall.get("risk_label", ""),
                "answer_correct":    r.get("answer_correct", ""),
            })

    # Text report
    txt_path = os.path.join(out_dir, f"rag_eval_{ts}_report.txt")
    _write_txt_report(txt_path, aggregate, offline, results)

    return json_path, csv_path, txt_path


def _write_txt_report(path: str, agg: Dict, offline: Dict, results: List[Dict]) -> None:
    sep = "=" * 70

    with open(path, "w", encoding="utf-8") as fh:
        def w(line=""): fh.write(line + "\n")  # noqa: E306

        w(sep); w("  LAPORAN EVALUASI RAG — CSIPBLLM")
        w(f"  Tanggal  : {datetime.now().strftime('%d %B %Y, %H:%M:%S')}")
        w(f"  Peneliti : Muhammad Ajisaka Arsyi Taj (G6401221090)")
        w(sep); w()

        ret = agg.get("retrieval", {})
        gen = agg.get("generation", {})
        aq  = agg.get("answer_quality", {})

        w(f"  Test cases   : {agg['n_tested']}")
        w()
        w("  [A] RETRIEVAL")
        w(f"      Precision@K    : {ret.get('avg_precision_at_k')}")
        w(f"      Recall@K       : {ret.get('avg_recall_at_k')}")
        w(f"      Mean Similarity: {ret.get('avg_mean_similarity')}")
        w(f"      Coverage       : {ret.get('avg_coverage')}")
        w(f"      Src Diversity  : {ret.get('avg_source_diversity')}")
        w()
        w("  [B] GENERATION")
        w(f"      Faithfulness      : {gen.get('avg_faithfulness')}")
        w(f"      Hallucination Risk: {gen.get('avg_hallucination_risk')}")
        w()
        w("  [C] ANSWER QUALITY")
        w(f"      Evaluated : {aq.get('total_evaluated')}")
        w(f"      Correct   : {aq.get('correct')}")
        w(f"      Accuracy  : {aq.get('accuracy')}")
        w()

        if offline and "error" not in offline:
            w("  [D] OFFLINE STATS")
            w(f"      Total interactions : {offline.get('total_interactions')}")
            w(f"      Unique sessions    : {offline.get('unique_sessions')}")
            w(f"      Avg reply length   : {offline.get('avg_reply_length_chars')} chars")
            w(f"      Follow-up rate     : {offline.get('followup_rate')}")
            w()

        w("-" * 70); w("DETAIL PER TEST CASE"); w("-" * 70)
        for r in results:
            ret_r  = r.get("retrieval", {})
            faith  = r.get("faithfulness") or {}
            hall   = r.get("hallucination") or {}
            w(f"\n  [{r['test_id']:02d}] {r['query'][:65]}")
            w(f"       Cognitive : {r['cognitive']}")
            if "precision_at_k" in ret_r:
                w(f"       P@K={ret_r['precision_at_k']:.4f}  R@K={ret_r['recall_at_k']:.4f}  "
                  f"MeanSim={ret_r['mean_similarity']:.4f}")
            if faith:
                w(f"       Faithfulness: {faith.get('faithfulness_score', '?'):.4f} ({faith.get('method', '?')})")
            if hall:
                w(f"       Hallucination: {hall.get('hallucination_risk', '?'):.4f} [{hall.get('risk_label', '?')}]")
            ans = r.get("answer_correct")
            if ans is not None:
                w(f"       Answer: {'✅ BENAR' if ans else '❌ SALAH'}")

        w(); w(sep); w("  Fine della valutazione"); w(sep)
