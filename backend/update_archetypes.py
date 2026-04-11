import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import ProfilingArchetype

ARCHETYPES_DATA = [
    {
        "code": "PAR",
        "name": "Architect",
        "tactics": ["Picture", "Analytic", "Reflective"],
        "description": "“Aku lihat detailnya dulu, baru aku susun semuanya jadi rencana.”",
        "short": "Melihat detail kecil dalam visual dan menyusun rencana dengan presisi.",
        "long": "Architect adalah tipe yang sangat teliti ketika berhadapan dengan informasi visual. Mereka tidak hanya melihat gambar secara sekilas, tetapi benar-benar memperhatikan setiap detail kecil yang ada. Setelah memahami bagian-bagiannya, mereka akan menyusunnya menjadi struktur atau rencana yang jelas dan terarah.\n\nTipe ini cenderung berhati-hati dan tidak terburu-buru dalam mengambil keputusan. Mereka lebih suka memastikan semuanya masuk akal sebelum melangkah. Dalam proses belajar, mereka unggul saat diberikan diagram, flowchart, atau visual yang kompleks selama mereka punya waktu untuk menganalisisnya secara mendalam.",
        "strengths": [
            "Teliti – Sangat peka terhadap detail visual kecil yang sering terlewat oleh orang lain",
            "Terstruktur – Mampu menyusun informasi menjadi rencana yang jelas dan sistematis",
            "Berpikir mendalam – Tidak asal paham, namun memastikan semuanya benar-benar masuk akal",
            "Konsisten – Cenderung menjaga kualitas dan akurasi dalam setiap langkah",
            "Perencana yang baik – Jarang bergerak tanpa arah; selalu punya strategi"
        ],
        "weaknesses": [
            "Terlalu lama menganalisis – Bisa terjebak overthinking sebelum mulai bertindak",
            "Kurang fleksibel – Sulit beradaptasi jika rencana berubah mendadak",
            "Perfeksionis – Terlalu fokus pada detail sampai menghambat progress",
            "Lambat mengambil keputusan – Butuh waktu lama untuk merasa yakin",
            "Kurang nyaman dengan trial-error – Cenderung menghindari percobaan spontan"
        ]
    },
    {
        "code": "PAI",
        "name": "Creator",
        "tactics": ["Picture", "Analytic", "Impulsive"],
        "description": "“Langsung coba aja, nanti sambil jalan aku pahami.”",
        "short": "Menyukai visual dan belajar dengan langsung mencoba secara hands-on.",
        "long": "Creator adalah tipe yang belajar paling cepat saat langsung terjun. Mereka tertarik pada visual, tetapi bukan untuk dianalisis lama melainkan untuk segera dijadikan bahan eksperimen. Mereka memahami detail sambil melakukan, bukan sebelum memulai.\n\nTipe ini cenderung spontan dan tidak takut salah. Justru dari trial and error, mereka membangun pemahaman yang kuat. Dalam pembelajaran, mereka cocok dengan aktivitas seperti simulasi, prototyping, atau latihan interaktif yang memungkinkan eksplorasi langsung.",
        "strengths": [
            "Cepat belajar lewat praktik – Langsung paham saat terjun dan mencoba sendiri",
            "Eksploratif – Tidak takut mencoba hal baru atau pendekatan berbeda",
            "Adaptif – Mudah menyesuaikan diri dengan situasi yang berubah",
            "Berani mengambil risiko – Tidak terlalu khawatir salah di awal",
            "Enerjik – Punya dorongan tinggi untuk langsung action"
        ],
        "weaknesses": [
            "Kurang perencanaan – Sering mulai tanpa arah yang jelas.",
            "Mudah ceroboh – Bisa melewatkan detail penting",
            "Cepat bosan – Kehilangan minat jika proses terlalu lama atau repetitif",
            "Kurang refleksi – Jarang berhenti untuk mengevaluasi proses",
            "Hasil tidak konsisten – Kualitas bisa naik turun karena impulsif"
        ]
    },
    {
        "code": "TAR",
        "name": "Scholar",
        "tactics": ["Text", "Analytic", "Reflective"],
        "description": "“Aku perlu baca dan pahami semuanya dulu sebelum lanjut.”",
        "short": "Mendalami teks secara detail dan memproses informasi dengan hati-hati.",
        "long": "Scholar adalah tipe yang sangat nyaman dengan teks dan informasi tertulis. Mereka membaca dengan teliti, memperhatikan setiap kata, dan berusaha memahami makna secara menyeluruh sebelum bergerak ke bagian berikutnya.\n\nMereka tidak terburu-buru, karena bagi mereka pemahaman yang dalam lebih penting daripada kecepatan. Tipe ini sangat kuat dalam analisis konseptual, teori, dan materi yang membutuhkan ketelitian tinggi. Mereka berkembang baik dalam lingkungan belajar yang terstruktur, jelas, dan memberikan waktu untuk refleksi.",
        "strengths": [
            "Sangat teliti – Memahami teks dengan akurat dan mendalam",
            "Analitis kuat – Mampu mengurai konsep kompleks dengan baik",
            "Sabar – Tidak terburu-buru dalam memahami materi",
            "Kritis – Tidak mudah menerima informasi tanpa dipahami dulu",
            "Kuat di teori – Cocok untuk materi konseptual dan akademik"
        ],
        "weaknesses": [
            "Lambat bergerak – Butuh waktu lama untuk lanjut ke tahap berikutnya",
            "Overthinking – Terlalu banyak mempertimbangkan hal kecil",
            "Kurang praktis – Sulit langsung menerapkan tanpa pemahaman penuh",
            "Mudah lelah dengan informasi panjang – Terutama jika informasinya tidak terstruktur",
            "Kurang spontan – Tidak nyaman dengan keputusan cepat"
        ]
    },
    {
        "code": "PGR",
        "name": "Explorer",
        "tactics": ["Picture", "Global", "Reflective"],
        "description": "“Aku lihat gambaran besarnya dulu, baru aku pahami pelan-pelan.”",
        "short": "Melihat gambaran besar melalui visual dan memahami secara bertahap.",
        "long": "Explorer adalah tipe yang fokus pada gambaran besar. Mereka menyukai visual seperti peta, diagram, atau overview karena membantu mereka memahami konteks secara menyeluruh.\n\nMereka tidak langsung masuk ke detail, melainkan membangun pemahaman secara perlahan dari big picture ke bagian-bagian kecil. Tipe ini reflektif, sehingga mereka butuh waktu untuk menghubungkan berbagai informasi sebelum merasa yakin. Dalam belajar, mereka cocok dengan materi yang dimulai dari overview sebelum masuk ke detail.",
        "strengths": [
            "Melihat gambaran besar – Cepat memahami konteks secara keseluruhan",
            "Terhubung antar konsep – Mudah melihat hubungan antar informasi",
            "Reflektif – Memikirkan langkah dengan matang.",
            "Strategis dalam memahami alur – Tidak mudah tersesat dalam detail",
            "Cocok untuk eksplorasi awal – Bagus dalam tahap orientasi/top-level understanding"
        ],
        "weaknesses": [
            "Kurang detail – Bisa melewatkan informasi penting di level kecil",
            "Butuh waktu memahami detail – Tidak langsung kuat di bagian teknis",
            "Kadang terlalu umum – Pemahaman bisa dangkal jika tidak diperdalam",
            "Sulit langsung action – Karena masih ingin memahami keseluruhan dulu",
            "Bisa kehilangan fokus – Jika informasi terlalu banyak cabang"
        ]
    },
    {
        "code": "PGI",
        "name": "Artist",
        "tactics": ["Picture", "Global", "Impulsive"],
        "description": "“Aku langsung nangkep feel-nya, sisanya bisa nyusul.”",
        "short": "Menangkap gambaran visual secara cepat dan merespons secara spontan.",
        "long": "Artist adalah tipe yang intuitif dan cepat dalam memahami visual. Mereka tidak butuh banyak penjelasan detail; cukup melihat gambaran umum, mereka sudah bisa “menangkap” arah atau tujuan.\n\nMereka cenderung impulsif dan mengandalkan insting dalam mengambil keputusan. Dalam belajar, mereka lebih suka pendekatan yang visual, kreatif, dan tidak terlalu kaku. Tipe ini berkembang dalam lingkungan yang memberi kebebasan eksplorasi dan tidak terlalu menuntut urutan yang kaku.",
        "strengths": [
            "Cepat menangkap visual – Langsung paham arah atau “feel” dari suatu informasi",
            "Intuitif – Mengandalkan insting yang sering tepat",
            "Kreatif – Mudah menghasilkan ide dari gambaran umum",
            "Responsif – Cepat bereaksi terhadap stimulus visual",
            "Fleksibel – Tidak kaku dalam cara berpikir"
        ],
        "weaknesses": [
            "Kurang detail – Jarang memperhatikan hal kecil yang krusial",
            "Impulsif – Bisa mengambil keputusan tanpa pertimbangan cukup",
            "Sulit mengikuti struktur – Kurang nyaman dengan langkah yang kaku",
            "Mudah salah interpretasi – Karena hanya mengandalkan gambaran besar",
            "Kurang konsisten – Tergantung mood atau intuisi saat itu"
        ]
    },
    {
        "code": "TAI",
        "name": "Editor",
        "tactics": ["Text", "Analytic", "Impulsive"],
        "description": "“Aku cari poin pentingnya, langsung ambil keputusan.”",
        "short": "Memindai teks untuk fakta penting dan mengambil keputusan dengan cepat.",
        "long": "Editor adalah tipe yang efisien dalam memproses teks. Mereka tidak membaca semuanya secara mendalam, tetapi fokus mencari informasi kunci yang relevan. Setelah menemukan apa yang dibutuhkan, mereka langsung bertindak.\n\nTipe ini cepat, praktis, and goal-oriented. Mereka cocok untuk situasi yang membutuhkan pengambilan keputusan cepat berbasis informasi. Dalam pembelajaran, mereka lebih suka materi yang to the point, seperti bullet points, highlight, atau ringkasan.",
        "strengths": [
            "Efisien – Cepat menemukan informasi penting dalam teks",
            "To the point – Fokus pada hal yang relevan saja",
            "Cepat mengambil keputusan – Tidak bertele-tele",
            "Praktis – Cocok untuk tugas berbasis output cepat",
            "Produktif – Bisa memproses banyak informasi dalam waktu singkat"
        ],
        "weaknesses": [
            "Kurang mendalam – Tidak selalu memahami konteks penuh",
            "Melewatkan nuansa penting – Fokus hanya pada fakta utama",
            "Rentan salah konteks – Jika informasi butuh pemahaman menyeluruh",
            "Terlalu cepat mengambil keputusan – Bisa kurang akurat",
            "Kurang refleksi – Jarang mengecek ulang pemahaman"
        ]
    },
    {
        "code": "TGI",
        "name": "Scout",
        "tactics": ["Text", "Global", "Impulsive"],
        "description": "“Aku butuh tahu intinya aja, biar bisa langsung jalan.”",
        "short": "Menangkap ide utama dari teks dan bergerak cepat tanpa mendalami detail.",
        "long": "Scout adalah tipe yang fokus pada inti informasi. Mereka membaca secara cepat untuk memahami “apa yang sedang terjadi” tanpa terlalu memikirkan detail atau proses di baliknya.\n\nMereka sangat cepat dalam orientasi dan adaptasi, tetapi tidak selalu mendalami informasi secara mendalam. Dalam belajar, mereka cocok dengan overview, summary, atau headline yang memberi gambaran cepat sebelum mereka bergerak ke tindakan berikutnya.",
        "strengths": [
            "Cepat memahami inti – Langsung menangkap ide utama dari teks",
            "Gesit – Cepat bergerak dari satu informasi ke informasi lain.",
            "Adaptif – Mudah mengikuti perubahan konteks",
            "Efektif untuk scanning – Sangat kuat di tahap eksplorasi awal",
            "Tidak mudah overthinking – Fokus pada “cukup tahu untuk lanjut”"
        ],
        "weaknesses": [
            "Dangkal dalam pemahaman – Jarang mendalami detail",
            "Mudah melewatkan informasi penting – Jika tidak terlihat di permukaan",
            "Kurang akurasi – Karena hanya mengandalkan headline-level info",
            "Kurang sabar – Sulit bertahan di materi yang kompleks",
            "Keputusan terburu-buru – Berdasarkan informasi yang belum lengkap"
        ]
    },
    {
        "code": "TGR",
        "name": "Strategist",
        "tactics": ["Text", "Global", "Reflective"],
        "description": "“Aku pahami konteksnya dulu, baru aku tentukan langkah terbaik.”",
        "short": "Memahami makna di balik teks dan mempertimbangkan berbagai opsi sebelum bertindak.",
        "long": "Strategist adalah tipe yang membaca teks dengan fokus pada makna yang lebih dalam. Mereka tidak hanya memahami apa yang tertulis, tetapi juga mencoba membaca konteks, implikasi, dan kemungkinan yang ada.\n\nMereka reflektif dan cenderung mempertimbangkan berbagai sudut pandang sebelum mengambil keputusan. Dalam belajar, mereka cocok dengan materi yang mengajak berpikir kritis, analisis kasus, dan eksplorasi ide secara menyeluruh.",
        "strengths": [
            "Berpikir strategis – Mampu melihat berbagai kemungkinan sebelum bertindak",
            "Memahami konteks dalam – Tidak hanya membaca teks, tapi juga maknanya",
            "Reflektif – Mengambil keputusan dengan pertimbangan matang",
            "Kritis – Mampu mengevaluasi informasi dari berbagai sudut pandang",
            "Seimbang – Menggabungkan pemahaman global dengan analisis"
        ],
        "weaknesses": [
            "Lambat mengambil keputusan – Karena terlalu banyak mempertimbangkan opsi",
            "Overthinking – Bisa terjebak dalam analisis berlebihan",
            "Kurang cepat dalam eksekusi – Terlalu lama di tahap perencanaan",
            "Sulit di situasi mendesak – Karena butuh waktu untuk berpikir",
            "Kadang terlalu kompleks – Membuat hal sederhana jadi terasa rumit"
        ]
    },
]

for arc in ARCHETYPES_DATA:
    obj, created = ProfilingArchetype.objects.get_or_create(code=arc["code"])
    obj.archetype_name = arc["name"]
    obj.description = arc["description"]
    obj.tactics_description = arc["short"]
    obj.cognitive_description = arc["long"]
    obj.strengths = arc["strengths"]
    obj.weaknesses = arc["weaknesses"]
    obj.tactics = arc["tactics"]
    obj.tactics_image = f"/images/traits/{arc['code']} 2.png"
    obj.save()
    status = "CREATED" if created else "UPDATED"
    print(f"[{status}] {obj.code} - {obj.archetype_name}")

print("\nFinal update complete. All fields populated correctly.")
