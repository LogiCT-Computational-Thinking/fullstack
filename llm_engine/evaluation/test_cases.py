"""
evaluation/test_cases.py
─────────────────────────
Test-case dataset for the RAG evaluation suite.

Design principles for these queries
────────────────────────────────────
1. HUMAN-LIKE FRAMING — questions read like a real student typing into a chat:
   hesitation markers, partial context ("I just learned…"), scenario setups,
   follow-up style ("wait, so…"), and occasional Indonesian mixing.

2. CT TECHNICALITY — every question maps to a concrete Computational Thinking
   concept (decomposition, abstraction, pattern recognition, algorithm design,
   complexity, data structures).

3. QUERY TYPES — five archetypes that cover the range of real student behaviour:
   • conceptual    — "what is / apa itu" — basic definitional
   • comparative   — "what's the diff / apa bedanya" — two concepts side-by-side
   • scenario      — grounded in a real mini-problem the student is solving
   • confusion     — student states a misconception and asks for clarification
   • application   — student wants to apply something they just learned

Each entry:
  query             — the raw question sent to /chat
  reference_answer  — ground-truth used by the Ollama local evaluator
  relevant_keywords — terms that SHOULD appear in retrieved material chunks
  cognitive         — 4-char cognitive type code
  session_id        — unique ID for this eval run
  query_type        — archetype label (for reporting)
  context_note      — short human-readable note on the scenario
"""

from typing import Dict, List

TEST_CASES: List[Dict] = [

    # ── 1. Conceptual — Algoritma ──────────────────────────────────────────
    {
        "query": (
            "Pak, saya baru mulai belajar CT nih dan masih bingung. "
            "Jadi kalau dibilang 'algoritma' itu sebenernya maksudnya apa sih? "
            "Apa bedanya sama langkah-langkah biasa yang kita tulis di kertas?"
        ),
        "reference_answer": (
            "Algoritma adalah urutan instruksi yang terdefinisi jelas, terbatas, dan "
            "pasti berhenti untuk menyelesaikan suatu masalah. Berbeda dari langkah biasa, "
            "algoritma harus deterministik, tidak ambigu, dan menghasilkan output yang benar."
        ),
        "relevant_keywords": ["algoritma", "instruksi", "urutan", "deterministik", "langkah"],
        "cognitive": "1PAR",
        "session_id": "eval-001",
        "query_type": "conceptual",
        "context_note": "Mahasiswa baru pertama kali dengar istilah 'algoritma' dalam konteks CT",
    },

    # ── 2. Scenario — Dekomposisi ──────────────────────────────────────────
    {
        "query": (
            "Oke jadi saya lagi ngerjain tugas bikin aplikasi absensi mahasiswa. "
            "Masalahnya gede banget, saya gak tau mulai dari mana. "
            "Kata teman saya pakai 'dekomposisi' bisa bantu — bisa dijelasin caranya "
            "kalau diterapin ke kasus absensi ini?"
        ),
        "reference_answer": (
            "Dekomposisi adalah teknik memecah masalah besar menjadi sub-masalah yang lebih kecil "
            "dan mudah dikelola. Untuk aplikasi absensi: pecah menjadi (1) input data mahasiswa, "
            "(2) pencatatan kehadiran, (3) penyimpanan data, (4) laporan. Setiap bagian bisa "
            "dikerjakan dan diuji secara terpisah."
        ),
        "relevant_keywords": ["dekomposisi", "sub-masalah", "bagian", "pecah", "modular"],
        "cognitive": "2PAR",
        "session_id": "eval-002",
        "query_type": "scenario",
        "context_note": "Mahasiswa menghadapi proyek nyata dan mencari cara memulai",
    },

    # ── 3. Confusion — Rekursi vs Iterasi ─────────────────────────────────
    {
        "query": (
            "Saya agak bingung nih. Katanya rekursi itu fungsi yang manggil dirinya sendiri, "
            "tapi kan itu keliatannya bakal jalan terus dong tanpa henti? "
            "Terus bedanya sama loop while apa, bukannya keduanya 'ngulang' sesuatu?"
        ),
        "reference_answer": (
            "Rekursi berhenti karena ada base case — kondisi yang menghentikan pemanggilan diri. "
            "Tanpa base case, memang terjadi stack overflow. Perbedaan dengan iterasi: rekursi "
            "menyimpan state di call stack (memori lebih besar), iterasi di loop variable. "
            "Rekursi lebih elegan untuk masalah hirarkis (tree, fractal), iterasi lebih efisien."
        ),
        "relevant_keywords": ["rekursi", "base case", "iterasi", "stack", "perulangan"],
        "cognitive": "3TGR",
        "session_id": "eval-003",
        "query_type": "confusion",
        "context_note": "Mahasiswa punya miskonsepsi bahwa rekursi = infinite loop",
    },

    # ── 4. Application — Bubble Sort ──────────────────────────────────────
    {
        "query": (
            "Saya nemu array [64, 25, 12, 22, 11] dan disuruh sort manual pakai bubble sort. "
            "Tapi saya gak yakin mekanismenya — setiap iterasi itu yang bergerak elemennya yang "
            "mana? Bisa tolong jelasin langkah pertamanya buat array itu?"
        ),
        "reference_answer": (
            "Bubble sort membandingkan dua elemen berdampingan dan menukar jika yang kiri lebih besar. "
            "Iterasi pertama pada [64,25,12,22,11]: bandingkan 64>25 → tukar → [25,64,12,22,11], "
            "64>12 → tukar → [25,12,64,22,11], 64>22 → tukar → [25,12,22,64,11], "
            "64>11 → tukar → [25,12,22,11,64]. Elemen terbesar 'menggelembung' ke akhir."
        ),
        "relevant_keywords": ["bubble sort", "bandingkan", "tukar", "elemen", "iterasi"],
        "cognitive": "2PAI",
        "session_id": "eval-004",
        "query_type": "application",
        "context_note": "Mahasiswa mengerjakan contoh konkret, butuh trace langkah per langkah",
    },

    # ── 5. Conceptual — Abstraksi ──────────────────────────────────────────
    {
        "query": (
            "Dalam materi CT pilar keempat itu abstraksi. Tapi saya masih blur — "
            "abstraksi itu berarti kita 'sembunyiin' detail yang gak penting kan? "
            "Tapi gimana kita tau detail mana yang penting dan mana yang bisa diabaikan?"
        ),
        "reference_answer": (
            "Abstraksi adalah proses mengidentifikasi dan menyimpan hanya informasi yang relevan "
            "untuk tujuan tertentu, mengabaikan detail yang tidak mempengaruhi solusi. "
            "Cara menentukan: tanyakan 'apakah detail ini mengubah output/solusi?' — jika tidak, "
            "abaikan. Contoh: peta jalan hanya tampilkan nama jalan, bukan warna aspal."
        ),
        "relevant_keywords": ["abstraksi", "relevan", "detail", "sederhanakan", "informasi"],
        "cognitive": "4TAI",
        "session_id": "eval-005",
        "query_type": "conceptual",
        "context_note": "Mahasiswa paham definisi tapi bingung cara praktis menerapkan abstraksi",
    },

    # ── 6. Scenario — Pattern Recognition ─────────────────────────────────
    {
        "query": (
            "Pak saya lagi analisis data nilai ujian 100 mahasiswa. "
            "Banyak yang dapat nilai rendah di soal nomor 3 dan 7 yang keduanya soal rekursi. "
            "Ini ada hubungannya sama pattern recognition di CT? Atau saya terlalu GR?"
        ),
        "reference_answer": (
            "Itu tepat — kamu sedang menerapkan pattern recognition. Kamu mengidentifikasi pola "
            "berulang (nilai rendah pada soal rekursi) dari data besar. Pattern recognition dalam CT "
            "adalah kemampuan mengenali kesamaan, tren, atau keterulangan yang bisa dimanfaatkan "
            "untuk solusi yang lebih umum dan efisien."
        ),
        "relevant_keywords": ["pattern recognition", "pola", "kesamaan", "tren", "identifikasi"],
        "cognitive": "3TGI",
        "session_id": "eval-006",
        "query_type": "scenario",
        "context_note": "Mahasiswa menemukan pola dalam data nyata dan ragu itu termasuk CT",
    },

    # ── 7. Comparative — Big-O ────────────────────────────────────────────
    {
        "query": (
            "Saya baca kalau binary search itu O(log n) dan linear search O(n). "
            "Tapi kalau arraynya cuma 10 elemen, bedanya kan gak kerasa dong? "
            "Kapan sih penting buat peduli sama Big-O notation ini?"
        ),
        "reference_answer": (
            "Untuk n=10 memang perbedaannya kecil. Big-O penting saat n besar: O(n) pada n=1.000.000 "
            "= 1 juta operasi vs O(log n) = 20 operasi. Big-O mengukur laju pertumbuhan, bukan "
            "kecepatan absolut. Jadi untuk data kecil, pertimbangkan juga overhead algoritma; "
            "untuk data besar, Big-O menjadi faktor penentu."
        ),
        "relevant_keywords": ["Big-O", "kompleksitas", "log n", "pertumbuhan", "efisiensi"],
        "cognitive": "5PAI",
        "session_id": "eval-007",
        "query_type": "comparative",
        "context_note": "Mahasiswa mempertanyakan relevansi Big-O pada skala kecil",
    },

    # ── 8. Confusion — Array vs List ──────────────────────────────────────
    {
        "query": (
            "Di Python saya selalu pakai list, tapi dosen bilang itu beda sama array. "
            "Saya lihat di internet ada yang bilang list Python itu 'dynamic array'. "
            "Jadi sebenernya mereka sama atau beda? Saya makin bingung."
        ),
        "reference_answer": (
            "Array klasik adalah blok memori berurutan bertipe sama dengan ukuran tetap. "
            "Python list adalah dynamic array — bisa berisi berbagai tipe, ukuran bisa berubah, "
            "tapi di balik layar tetap menggunakan array dengan resizing otomatis. "
            "Perbedaan praktis: array (numpy) lebih efisien untuk operasi numerik massal; "
            "Python list lebih fleksibel tapi ada overhead."
        ),
        "relevant_keywords": ["array", "list", "memori", "tipe", "dynamic", "indeks"],
        "cognitive": "2TGI",
        "session_id": "eval-008",
        "query_type": "confusion",
        "context_note": "Mahasiswa bingung karena Python list dan array tampak serupa",
    },

    # ── 9. Application — Pseudocode ───────────────────────────────────────
    {
        "query": (
            "Tugas saya harus bikin pseudocode sebelum coding. "
            "Masalahnya saya gak tau formatnya harus sedetail apa — "
            "apakah harus mirip Python, atau boleh pakai bahasa Indonesia semua? "
            "Ada aturan resmi gak untuk pseudocode?"
        ),
        "reference_answer": (
            "Pseudocode tidak punya standar baku — tujuannya adalah keterbacaan manusia, bukan "
            "eksekusi mesin. Boleh bahasa Indonesia, campuran, atau mirip Python. Yang penting: "
            "setiap langkah jelas dan tidak ambigu, struktur kontrol (if/loop) dinyatakan eksplisit, "
            "dan variabel dinamai bermakna. Hindari detail sintaks bahasa tertentu."
        ),
        "relevant_keywords": ["pseudocode", "algoritma", "langkah", "struktur", "keterbacaan"],
        "cognitive": "1PAR",
        "session_id": "eval-009",
        "query_type": "application",
        "context_note": "Mahasiswa kebingungan soal standar penulisan pseudocode",
    },

    # ── 10. Comparative — Linked List vs Array ────────────────────────────
    {
        "query": (
            "Kalau saya mau bikin daftar kontak di aplikasi yang sering insert/delete data, "
            "lebih baik pakai linked list atau array? "
            "Saya dengar linked list lebih bagus untuk insert tapi saya gak paham kenapa."
        ),
        "reference_answer": (
            "Linked list unggul untuk insert/delete karena hanya mengubah pointer — O(1) jika "
            "posisi diketahui. Array harus menggeser semua elemen — O(n). Tapi linked list lebih "
            "lambat untuk akses acak (O(n) vs O(1) array). Untuk daftar kontak dengan banyak "
            "insert/delete: linked list. Untuk akses cepat berdasarkan indeks: array."
        ),
        "relevant_keywords": ["linked list", "pointer", "node", "insert", "array", "akses"],
        "cognitive": "3PAI",
        "session_id": "eval-010",
        "query_type": "comparative",
        "context_note": "Mahasiswa sedang memilih struktur data untuk kasus konkret",
    },

    # ── 11. Application — Binary Search ───────────────────────────────────
    {
        "query": (
            "Saya coba implementasi binary search tapi hasilnya kadang salah. "
            "Array saya sudah diurutkan: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]. "
            "Kalau saya cari angka 23, langkah-langkahnya gimana seharusnya?"
        ),
        "reference_answer": (
            "Binary search pada [2,5,8,12,16,23,38,56,72,91] mencari 23: "
            "mid=(0+9)/2=4 → arr[4]=16 < 23 → cari kanan. "
            "mid=(5+9)/2=7 → arr[7]=56 > 23 → cari kiri. "
            "mid=(5+6)/2=5 → arr[5]=23 = target → ditemukan di indeks 5. "
            "Total 3 perbandingan vs 6 untuk linear search."
        ),
        "relevant_keywords": ["binary search", "tengah", "terurut", "indeks", "perbandingan"],
        "cognitive": "4PAR",
        "session_id": "eval-011",
        "query_type": "application",
        "context_note": "Mahasiswa debugging implementasi binary search dengan trace manual",
    },

    # ── 12. Conceptual — Stack ────────────────────────────────────────────
    {
        "query": (
            "Saya dengar stack itu kayak 'tumpukan piring' — yang terakhir masuk, pertama keluar. "
            "Tapi di dunia nyata, di mana stack ini beneran dipake? "
            "Kayaknya abstrak banget kalau cuma diibaratkan piring."
        ),
        "reference_answer": (
            "Stack digunakan di: (1) function call stack — setiap pemanggilan fungsi push frame, "
            "return pop frame; (2) undo/redo di text editor; (3) evaluasi ekspresi matematika; "
            "(4) navigasi browser (back button). Prinsip LIFO memastikan konteks terakhir "
            "selalu yang pertama diselesaikan — kritikal untuk rekursi."
        ),
        "relevant_keywords": ["stack", "LIFO", "push", "pop", "call stack", "rekursi"],
        "cognitive": "2TAI",
        "session_id": "eval-012",
        "query_type": "conceptual",
        "context_note": "Mahasiswa minta contoh dunia nyata agar konsep stack lebih konkret",
    },

    # ── 13. Application — Flowchart ───────────────────────────────────────
    {
        "query": (
            "Saya mau gambar flowchart untuk sistem login — user input username+password, "
            "kalau salah 3 kali dikunci. Simbol apa yang harus saya pakai untuk "
            "bagian 'cek password' dan 'hitung percobaan gagal'-nya?"
        ),
        "reference_answer": (
            "Untuk sistem login: gunakan belah ketupat (diamond) untuk keputusan 'password benar?' "
            "dan 'percobaan >= 3?'. Gunakan persegi panjang (rectangle) untuk proses 'increment "
            "counter' dan 'kunci akun'. Oval untuk Start/End. Panah menghubungkan alur dengan "
            "label Ya/Tidak pada tiap diamond."
        ),
        "relevant_keywords": ["flowchart", "simbol", "diamond", "keputusan", "proses", "alur"],
        "cognitive": "1TGR",
        "session_id": "eval-013",
        "query_type": "application",
        "context_note": "Mahasiswa mengerjakan flowchart untuk sistem nyata",
    },

    # ── 14. Scenario — Queue ──────────────────────────────────────────────
    {
        "query": (
            "Saya lagi bikin simulasi antrian di klinik — pasien datang, didaftarkan, "
            "dipanggil dokter satu-satu. Teman saya bilang pakai queue. "
            "Itu FIFO kan? Jadi kalau pasien ke-3 datang, dia dipanggil ke-3 juga? "
            "Terus bagaimana kalau ada pasien prioritas?"
        ),
        "reference_answer": (
            "Benar, queue adalah FIFO — pasien ke-3 dipanggil ke-3. Untuk prioritas, "
            "gunakan priority queue: setiap elemen punya nilai prioritas, elemen prioritas "
            "tertinggi di-dequeue duluan terlepas dari urutan masuk. "
            "Implementasi dengan min-heap atau sorted linked list."
        ),
        "relevant_keywords": ["queue", "FIFO", "antrian", "enqueue", "dequeue", "prioritas"],
        "cognitive": "3TAR",
        "session_id": "eval-014",
        "query_type": "scenario",
        "context_note": "Mahasiswa membangun simulasi antrian dan menemukan kasus edge priority",
    },

    # ── 15. Comparative — Selection Sort vs Bubble Sort ───────────────────
    {
        "query": (
            "Jadi tadi kita bahas bubble sort. Sekarang saya baca tentang selection sort. "
            "Keduanya O(n²) kan? Jadi apa gunanya belajar keduanya kalau sama-sama lambat? "
            "Kapan saya pilih selection sort over bubble sort?"
        ),
        "reference_answer": (
            "Meskipun sama-sama O(n²), selection sort membuat lebih sedikit swap (selalu tepat n-1 swap) "
            "vs bubble sort yang bisa swap O(n²) kali. Ini penting jika operasi tukar itu mahal "
            "(misal menulis ke disk atau SSD). Bubble sort lebih bagus jika data hampir terurut "
            "(bisa O(n) dengan optimasi). Belajar keduanya melatih analisis trade-off algoritma."
        ),
        "relevant_keywords": ["selection sort", "bubble sort", "swap", "perbandingan", "trade-off"],
        "cognitive": "4PGR",
        "session_id": "eval-015",
        "query_type": "comparative",
        "context_note": "Mahasiswa mempertanyakan manfaat mempelajari dua algoritma O(n²)",
    },

    # ── 16. Confusion — Rekursi Base Case ─────────────────────────────────
    {
        "query": (
            "Saya coba bikin fungsi faktorial rekursif tapi dapat RecursionError. "
            "Kodenya: def faktorial(n): return n * faktorial(n-1). "
            "Apa yang salah? Saya pikir n pasti akan mencapai 1 sendiri."
        ),
        "reference_answer": (
            "Masalahnya: tidak ada base case. Ketika n=1, fungsi masih memanggil faktorial(0), "
            "lalu faktorial(-1), dan seterusnya tanpa henti sampai stack overflow. "
            "Perbaikan: tambahkan if n <= 1: return 1. Base case adalah kondisi penghenti "
            "yang HARUS ada di setiap fungsi rekursif."
        ),
        "relevant_keywords": ["rekursif", "base case", "stack overflow", "faktorial", "kondisi berhenti"],
        "cognitive": "3TGI",
        "session_id": "eval-016",
        "query_type": "confusion",
        "context_note": "Mahasiswa debugging RecursionError karena lupa base case",
    },

    # ── 17. Scenario — Tree ───────────────────────────────────────────────
    {
        "query": (
            "Saya disuruh representasikan struktur folder sistem file (folder bisa punya "
            "subfolder dan file di dalamnya) sebagai struktur data. "
            "Dosen bilang pakai tree. Kenapa tree cocok untuk ini? "
            "Node-nya itu apa dan edge-nya apa?"
        ),
        "reference_answer": (
            "Tree cocok karena sistem file bersifat hierarki — satu root, tiap node bisa punya "
            "nol atau lebih anak. Node = folder atau file; edge = relasi 'berisi'. "
            "Root = folder paling atas (/). Folder = internal node (punya anak); "
            "File = leaf node (tidak punya anak). Traversal DFS cocok untuk list semua file."
        ),
        "relevant_keywords": ["tree", "node", "edge", "hierarki", "akar", "leaf", "traversal"],
        "cognitive": "3PGI",
        "session_id": "eval-017",
        "query_type": "scenario",
        "context_note": "Mahasiswa memodelkan sistem file nyata menggunakan tree",
    },

    # ── 18. Conceptual — Variabel dan Tipe Data ───────────────────────────
    {
        "query": (
            "Pertanyaan basic tapi saya mau mastiin paham beneran — "
            "kalau saya tulis umur = 20 di Python, tipe datanya otomatis int. "
            "Tapi di bahasa lain katanya harus deklarasi dulu. "
            "Ini bedanya static typing vs dynamic typing? Mana yang lebih aman?"
        ),
        "reference_answer": (
            "Benar. Dynamic typing (Python): tipe ditentukan saat runtime — fleksibel tapi "
            "error tipe baru muncul saat dieksekusi. Static typing (Java, C): tipe harus "
            "dideklarasikan — lebih verbose tapi error terdeteksi saat kompilasi. "
            "'Lebih aman' bergantung konteks: static typing lebih aman untuk sistem besar; "
            "dynamic lebih produktif untuk prototipe cepat."
        ),
        "relevant_keywords": ["tipe data", "variabel", "static", "dynamic", "deklarasi", "runtime"],
        "cognitive": "2TGR",
        "session_id": "eval-018",
        "query_type": "conceptual",
        "context_note": "Mahasiswa mengobservasi perbedaan Python vs bahasa lain",
    },

    # ── 19. Application — If-Else ─────────────────────────────────────────
    {
        "query": (
            "Saya bikin program nilai — A kalau >= 85, B kalau >= 70, C kalau >= 55, D sisanya. "
            "Saya pakai 4 if terpisah tapi kadang nilai 90 muncul sebagai A dan B sekaligus. "
            "Salah di mana? Apa bedanya pakai if berulang vs if-elif-else?"
        ),
        "reference_answer": (
            "4 if terpisah dievaluasi semua secara independen — nilai 90 memenuhi >= 85 DAN >= 70 "
            "sehingga keduanya dieksekusi. Dengan if-elif-else: begitu satu kondisi true, blok "
            "lainnya dilewati. Gunakan: if nilai >= 85: A elif nilai >= 70: B elif nilai >= 55: C "
            "else: D. Ini mutual exclusive — hanya satu cabang yang jalan."
        ),
        "relevant_keywords": ["if", "elif", "else", "kondisi", "percabangan", "mutual exclusive"],
        "cognitive": "2TAR",
        "session_id": "eval-019",
        "query_type": "confusion",
        "context_note": "Mahasiswa debugging bug logika karena salah pakai if vs elif",
    },

    # ── 20. Comparative — For vs While ────────────────────────────────────
    {
        "query": (
            "Kapan saya harus pakai for dan kapan while? "
            "Guru saya bilang 'pakai for kalau tau jumlah iterasinya', tapi "
            "saya bisa aja hitung dulu terus pakai for. Jadi apa bedanya beneran secara CT?"
        ),
        "reference_answer": (
            "Secara CT: for loop mengekspresikan iterasi yang terbatas dan terdefinisi — "
            "jumlah langkah diketahui sebelum loop dimulai, membuat niat kode lebih jelas. "
            "While lebih tepat saat kondisi berhenti bergantung pada state yang berubah "
            "(baca file sampai EOF, validasi input user). Secara teknis keduanya bisa saling "
            "menggantikan, tapi keterbacaan dan kejelasan niat berbeda."
        ),
        "relevant_keywords": ["for", "while", "iterasi", "kondisi", "perulangan", "bounded"],
        "cognitive": "4TAR",
        "session_id": "eval-020",
        "query_type": "comparative",
        "context_note": "Mahasiswa mempertanyakan perbedaan semantik for vs while, bukan hanya sintaks",
    },
]
