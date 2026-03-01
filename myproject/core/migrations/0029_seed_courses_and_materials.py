from django.db import migrations

# ──────────────────────────────────────────────
# Seed data: 14 courses, each with 2 materials
# and 1 Quiz (kosong, siap diisi soal lebih lanjut)
# ──────────────────────────────────────────────

COURSES_DATA = [
    {
        'week': 8,
        'title': 'Pengenalan Computational Thinking',
        'description': 'Materi pembelajaran mandiri untuk Pengenalan Computational Thinking pada Minggu ke-8.',
        'materials': [
            {'title': 'Apa itu Computational Thinking?',                   'file_type': 'pdf', 'order': 1, 'description': 'Pengantar konsep Computational Thinking dan mengapa penting dalam era digital.'},
            {'title': 'Komponen Dasar CT: Dekomposisi & Abstraksi',        'file_type': 'pdf', 'order': 2, 'description': 'Memahami dua pilar utama CT: dekomposisi masalah dan abstraksi data.'},
        ],
    },
    {
        'week': 9,
        'title': 'Dasar-Dasar Computational Thinking',
        'description': 'Materi pembelajaran mandiri untuk Dasar-Dasar Computational Thinking pada Minggu ke-9.',
        'materials': [
            {'title': 'Pengenalan Algoritma Sederhana',                    'file_type': 'ppt', 'order': 1, 'description': 'Apa itu algoritma, dan bagaimana menulis langkah-langkah penyelesaian masalah.'},
            {'title': 'Pengurutan dan Pencarian Data',                     'file_type': 'pdf', 'order': 2, 'description': 'Dasar-dasar sorting dan searching sebagai pondasi berpikir komputasional.'},
        ],
    },
    {
        'week': 10,
        'title': 'Fundamental Computational Thinking',
        'description': 'Materi pembelajaran mandiri untuk Fundamental Computational Thinking pada Minggu ke-10.',
        'materials': [
            {'title': 'Pattern Recognition dalam Kehidupan Nyata',         'file_type': 'pdf', 'order': 1, 'description': 'Menemukan pola dan kesamaan dalam berbagai masalah sehari-hari.'},
            {'title': 'Abstraction: Menyederhanakan Masalah',              'file_type': 'ppt', 'order': 2, 'description': 'Teknik abstraksi untuk menyisihkan detail tidak penting dan fokus pada inti masalah.'},
        ],
    },
    {
        'week': 11,
        'title': 'Fundamental Computational Thinking II',
        'description': 'Materi pembelajaran mandiri untuk Fundamental CT II pada Minggu ke-11.',
        'materials': [
            {'title': 'Decomposition: Memecah Masalah Besar',              'file_type': 'pdf', 'order': 1, 'description': 'Strategi dekomposisi untuk memecah masalah kompleks menjadi bagian-bagian kecil.'},
            {'title': 'Latihan Soal Dekomposisi',                          'file_type': 'pdf', 'order': 2, 'description': 'Kumpulan latihan soal untuk mengasah kemampuan dekomposisi masalah.'},
        ],
    },
    {
        'week': 12,
        'title': 'Pengenalan Pseudocode Sederhana',
        'description': 'Materi pembelajaran mandiri untuk Pengenalan Pseudocode pada Minggu ke-12.',
        'materials': [
            {'title': 'Sintaks Dasar Pseudocode',                          'file_type': 'pdf', 'order': 1, 'description': 'Aturan dan notasi umum dalam penulisan pseudocode.'},
            {'title': 'Menulis Pseudocode untuk Algoritma Sederhana',      'file_type': 'ppt', 'order': 2, 'description': 'Latihan menulis pseudocode untuk algoritma sehari-hari.'},
        ],
    },
    {
        'week': 12,
        'title': 'Struktur Kontrol dalam Pseudocode',
        'description': 'Memahami percabangan dan perulangan dalam penulisan pseudocode.',
        'materials': [
            {'title': 'Percabangan IF-ELSE dalam Pseudocode',              'file_type': 'pdf', 'order': 1, 'description': 'Cara menuliskan kondisi bercabang menggunakan pseudocode standar.'},
            {'title': 'Perulangan WHILE dan FOR',                          'file_type': 'ppt', 'order': 2, 'description': 'Membuat loop dengan WHILE dan FOR beserta contoh kasus nyata.'},
        ],
    },
    {
        'week': 13,
        'title': 'Algoritma Pengurutan',
        'description': 'Mempelajari berbagai algoritma pengurutan data pada Minggu ke-13.',
        'materials': [
            {'title': 'Bubble Sort & Selection Sort',                      'file_type': 'pdf', 'order': 1, 'description': 'Penjelasan dan visualisasi algoritma Bubble Sort dan Selection Sort.'},
            {'title': 'Insertion Sort & Merge Sort',                       'file_type': 'ppt', 'order': 2, 'description': 'Memahami cara kerja dan kompleksitas Insertion Sort dan Merge Sort.'},
        ],
    },
    {
        'week': 13,
        'title': 'Algoritma Pencarian',
        'description': 'Memahami algoritma pencarian data yang efisien.',
        'materials': [
            {'title': 'Linear Search vs Binary Search',                    'file_type': 'pdf', 'order': 1, 'description': 'Perbandingan performa Linear Search dan Binary Search dengan kompleksitas Big-O.'},
            {'title': 'Implementasi Algoritma Pencarian',                  'file_type': 'ppt', 'order': 2, 'description': 'Studi kasus implementasi pencarian dalam skenario data nyata.'},
        ],
    },
    {
        'week': 14,
        'title': 'Pengantar Struktur Data',
        'description': 'Mengenal struktur data dasar: Array, Stack, dan Queue.',
        'materials': [
            {'title': 'Array dan Operasi Dasar',                           'file_type': 'pdf', 'order': 1, 'description': 'Pengertian array, cara deklarasi, akses elemen, dan traversal.'},
            {'title': 'Stack dan Queue: Konsep & Aplikasi',                'file_type': 'ppt', 'order': 2, 'description': 'Prinsip LIFO (Stack) dan FIFO (Queue) beserta aplikasinya dalam CT.'},
        ],
    },
    {
        'week': 14,
        'title': 'Linked List dan Tree',
        'description': 'Mempelajari struktur data Linked List dan Binary Tree.',
        'materials': [
            {'title': 'Linked List: Singly & Doubly',                      'file_type': 'pdf', 'order': 1, 'description': 'Membangun dan memanipulasi Linked List satu arah dan dua arah.'},
            {'title': 'Binary Tree dan Traversal',                         'file_type': 'ppt', 'order': 2, 'description': 'Konsep Binary Tree beserta strategi traversal In-Order, Pre-Order, dan Post-Order.'},
        ],
    },
    {
        'week': 15,
        'title': 'Rekursi dan Backtracking',
        'description': 'Memahami konsep rekursi dan penerapan backtracking.',
        'materials': [
            {'title': 'Rekursi: Konsep Dasar dan Contoh',                  'file_type': 'pdf', 'order': 1, 'description': 'Pengertian rekursi, base case, dan contoh fungsi rekursif sederhana.'},
            {'title': 'Backtracking: Maze dan N-Queens',                   'file_type': 'ppt', 'order': 2, 'description': 'Memecahkan problem Maze Solver dan N-Queens menggunakan teknik Backtracking.'},
        ],
    },
    {
        'week': 15,
        'title': 'Dynamic Programming Dasar',
        'description': 'Pengenalan teknik Dynamic Programming untuk optimasi masalah.',
        'materials': [
            {'title': 'Memoization dan Tabulation',                        'file_type': 'pdf', 'order': 1, 'description': 'Perbedaan pendekatan top-down (memoization) dan bottom-up (tabulation) dalam DP.'},
            {'title': 'Studi Kasus: Fibonacci & Knapsack',                 'file_type': 'ppt', 'order': 2, 'description': 'Menyelesaikan Fibonacci Sequence dan 0/1 Knapsack Problem menggunakan DP.'},
        ],
    },
    {
        'week': 16,
        'title': 'Graph dan Pathfinding',
        'description': 'Memahami representasi graph dan algoritma traversal.',
        'materials': [
            {'title': 'BFS dan DFS pada Graph',                            'file_type': 'pdf', 'order': 1, 'description': 'Breadth-First Search dan Depth-First Search: cara kerja, visualisasi, dan kompleksitas.'},
            {'title': "Dijkstra's Algorithm dan A*",                       'file_type': 'ppt', 'order': 2, 'description': "Algoritma shortest-path Dijkstra dan heuristic search A* beserta contoh peta."},
        ],
    },
    {
        'week': 16,
        'title': 'Proyek Akhir: Penerapan CT',
        'description': 'Proyek akhir mengintegrasikan seluruh konsep Computational Thinking.',
        'materials': [
            {'title': 'Panduan Proyek Akhir CT',                           'file_type': 'pdf', 'order': 1, 'description': 'Panduan lengkap pengerjaan, format laporan, dan rubrik penilaian proyek akhir.'},
            {'title': 'Template & Rubrik Penilaian Proyek',                'file_type': 'pdf', 'order': 2, 'description': 'Template dokumen proyek dan tabel rubrik penilaian yang harus dipenuhi mahasiswa.'},
        ],
    },
]


def seed_courses_and_materials(apps, schema_editor):
    Course  = apps.get_model('core', 'Course')
    Material = apps.get_model('core', 'Material')
    Quiz     = apps.get_model('core', 'Quiz')

    for idx, course_data in enumerate(COURSES_DATA):
        # Buat / update Course
        course, _ = Course.objects.update_or_create(
            title=course_data['title'],
            defaults={
                'description': course_data['description'],
            }
        )

        # Buat / update setiap Material
        for mat_data in course_data['materials']:
            Material.objects.update_or_create(
                course=course,
                title=mat_data['title'],
                defaults={
                    'week':        course_data['week'],
                    'file_type':   mat_data['file_type'],
                    'order':       mat_data['order'],
                    'description': mat_data['description'],
                    # file dibiarkan kosong ('') karena belum ada file yang diupload
                    'file':        '',
                }
            )

        # Buat Quiz untuk course ini (jika belum ada)
        Quiz.objects.get_or_create(course=course)


def reverse_seed(apps, schema_editor):
    Course = apps.get_model('core', 'Course')
    for course_data in COURSES_DATA:
        Course.objects.filter(title=course_data['title']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0028_quizquestion_material'),
    ]

    operations = [
        migrations.RunPython(seed_courses_and_materials, reverse_code=reverse_seed),
    ]
