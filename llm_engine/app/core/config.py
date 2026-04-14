import os
from functools import lru_cache
from dataclasses import dataclass, field
from dotenv import load_dotenv

# Load .env file from the project root
load_dotenv()

@dataclass
class Settings:
    # ── OpenAI / ChatAnywhere (chat completions) ──────────────────────────
    openai_api_key:      str   = os.getenv("OPENAI_API_KEY", "sk-3b4dbH98VM7p7To528X0l0OT80k1k225GoicQRVvC5aMWxbT")
    openai_api_base:     str   = os.getenv("OPENAI_API_BASE", "https://api.chatanywhere.org/v1")
    chat_model:          str   = os.getenv("CHAT_MODEL", "gpt-3.5-turbo")
    embedding_model:     str   = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    chat_temperature:    float = float(os.getenv("CHAT_TEMPERATURE", "0.7"))
    chat_retries:        int   = int(os.getenv("CHAT_RETRIES", "3"))
    chat_retry_delay:    int   = int(os.getenv("CHAT_RETRY_DELAY", "2"))

    # ── Chat provider routing ─────────────────────────────────────────────
    chat_provider:       str   = os.getenv("CHAT_PROVIDER", "auto")

    # ── Embedding provider ────────────────────────────────────────────────
    embedding_provider:  str   = os.getenv("EMBEDDING_PROVIDER", "openai")

    # ── Ollama (fallback / local) ─────────────────────────────────────────
    ollama_base_url:     str   = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_chat_model:   str   = os.getenv("OLLAMA_CHAT_MODEL", "llama3")
    ollama_embed_model:  str   = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

    # ── RAG ───────────────────────────────────────────────────────────────
    rag_chunk_max_chars:  int = int(os.getenv("RAG_CHUNK_MAX_CHARS", "400"))
    rag_embed_chunk_size: int = int(os.getenv("RAG_EMBED_CHUNK_SIZE", "800"))
    rag_top_k:            int = int(os.getenv("RAG_TOP_K", "4"))

    # ── Session / history ─────────────────────────────────────────────────
    max_history_chars: int = int(os.getenv("MAX_HISTORY_CHARS", "1200"))

    # ── Server ────────────────────────────────────────────────────────────
    host:      str  = os.getenv("HOST", "0.0.0.0")
    port:      int  = int(os.getenv("PORT", "8001"))
    reload:    bool = os.getenv("RELOAD", "True").lower() == "true"
    log_level: str  = os.getenv("LOG_LEVEL", "info")

    # ── Paths ─────────────────────────────────────────────────────────────
    base_dir: str = field(
        default_factory=lambda: os.path.dirname(
            os.path.dirname(os.path.dirname(__file__))
        )
    )

    @property
    def materials_dir(self) -> str:
        return os.path.join(self.base_dir, "materials")

    @property
    def history_dir(self) -> str:
        return os.path.join(self.base_dir, "history_logs")

    @property
    def static_dir(self) -> str:
        return os.path.join(self.base_dir, "static")

    @property
    def rl_logs_dir(self) -> str:
        return os.path.join(self.base_dir, "rl_logs")

    @property
    def rl_plots_dir(self) -> str:
        return os.path.join(self.base_dir, "rl_plots")

    @property
    def eval_results_dir(self) -> str:
        return os.path.join(self.base_dir, "logs", "eval_results")

    @property
    def data_dir(self) -> str:
        return os.path.join(self.base_dir, "data")


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
