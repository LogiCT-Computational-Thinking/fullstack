# Panduan Perbaikan MySQL XAMPP (Shutdown Unexpectedly)

Jika suatu saat MySQL di XAMPP Anda tidak bisa di-START dan muncul error "MySQL shutdown unexpectedly", ikuti langkah-langkah di bawah ini untuk memperbaikinya tanpa menghapus database Anda.

### **Langkah 1: Backup Data Lama**
1.  Buka File Explorer ke folder: `C:\xampp\mysql\`
2.  Ubah nama folder **`data`** menjadi **`data_old`**.

### **Langkah 2: Siapkan Folder Data Baru**
1.  Buat folder baru bernama **`data`** di dalam `C:\xampp\mysql\`.
2.  Buka folder **`C:\xampp\mysql\backup\`**.
3.  Copy **SEMUA** file dan folder yang ada di dalam folder `backup` tersebut.
4.  Paste ke dalam folder **`data`** yang baru saja Anda buat.

### **Langkah 3: Kembalikan Database Anda**
1.  Buka folder **`C:\xampp\mysql\data_old\`**.
2.  Copy folder-folder database Anda (seperti **`logict`**, **`capstone`**, dll).
    - **PENTING:** JANGAN copy folder `mysql`, `performance_schema`, dan `phpmyadmin`.
3.  Paste folder-folder tersebut ke dalam folder **`C:\xampp\mysql\data\`** yang baru.

### **Langkah 4: Kembalikan File Metadata (Critical)**
1.  Buka kembali folder **`C:\xampp\mysql\data_old\`**.
2.  Cari file bernama **`ibdata1`**.
3.  Copy file tersebut dan Paste ke dalam folder **`C:\xampp\mysql\data\`** yang baru (pilih **Replace/Overwrite** jika ditanya).

### **Langkah 5: Coba Jalankan MySQL**
1.  Buka **XAMPP Control Panel**.
2.  Klik **Start** pada MySQL.
3.  Jika berhasil (warna hijau), Anda sudah bisa bekerja kembali.

---

### **💡 Tips Agar Tidak Terjadi Lagi:**
*   **Selalu Stop MySQL & Apache** di XAMPP Control Panel sebelum mematikan laptop atau menutup aplikasi XAMPP.
*   Tunggu sampai warna hijaunya hilang (benar-benar Stop) baru Anda boleh mematikan komputer.
*   Jangan mematikan paksa komputer saat database sedang memproses data yang besar.

---
*Catatan: File `C:\xampp\mysql\data_old` bisa Anda hapus jika setelah beberapa hari MySQL tetap berjalan lancar dan semua data Anda sudah dipastikan aman.*
