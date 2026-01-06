# Setup Aset untuk Login Page

## 📁 Struktur Folder yang Dibutuhkan

```
frontend/
├── public/
│   ├── images/
│   │   ├── logo-logict.png          # Logo LogiCT (28x28px atau lebih besar)
│   │   └── login-illustration.png   # Ilustrasi burung di hutan (sisi kanan)
│   └── fonts/
│       └── graphik/
│           ├── Graphik-Regular.woff2
│           ├── Graphik-Regular.woff
│           ├── Graphik-Medium.woff2
│           ├── Graphik-Medium.woff
│           ├── Graphik-Semibold.woff2
│           ├── Graphik-Semibold.woff
│           ├── Graphik-Bold.woff2
│           └── Graphik-Bold.woff
```

## 🖼️ Gambar yang Diperlukan

### 1. Logo LogiCT (`logo-logict.png`)
- **Ukuran**: Minimal 28x28px (atau 56x56px untuk retina)
- **Format**: PNG dengan background transparan
- **Lokasi**: `public/images/logo-logict.png`

### 2. Ilustrasi Login (`login-illustration.png`)
- **Deskripsi**: Gambar burung beo warna-warni di hutan (sesuai mockup)
- **Ukuran**: Minimal 1200x1200px (untuk kualitas tinggi)
- **Format**: PNG atau JPG
- **Lokasi**: `public/images/login-illustration.png`

## 🔤 Font Graphik Web

### Cara Mendapatkan Font Graphik:
1. **Jika Anda memiliki lisensi**: Download webfont kit dari provider lisensi Anda
2. **Alternatif**: Gunakan font serupa seperti Inter atau SF Pro (sudah ada fallback di code)

### Instalasi Font:
1. Buat folder: `public/fonts/graphik/`
2. Copy semua file `.woff2` dan `.woff` ke folder tersebut
3. Font sudah dikonfigurasi di `src/index.css` (baris 5-40)

### Jika Tidak Ada Lisensi Graphik:
Font akan otomatis fallback ke **Inter** atau **system-ui**. Tampilan tetap bagus!

## 🚀 Cara Menjalankan

```bash
# Install dependencies (jika belum)
npm install

# Jalankan dev server
npm run dev
```

Buka browser di `http://localhost:5173` untuk melihat halaman login.

## ✅ Checklist Setup

- [ ] Folder `public/images/` sudah dibuat
- [ ] File `logo-logict.png` sudah ada di `public/images/`
- [ ] File `login-illustration.png` sudah ada di `public/images/`
- [ ] Folder `public/fonts/graphik/` sudah dibuat (opsional)
- [ ] File font Graphik sudah dicopy (opsional)
- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` berjalan tanpa error

## 🎨 Catatan Desain

- Layout menggunakan **2 kolom**: form di kiri, ilustrasi di kanan
- Responsive: di mobile, ilustrasi pindah ke atas
- Button menggunakan gradient biru (#1d9bf0 → #1877f2)
- Input fields dengan rounded corner 14px dan subtle shadow
- Font Graphik dengan fallback ke Inter

## 🔗 Navigasi

- **Login page**: `/` (default)
- **Dashboard**: `/dashboard` (setelah login berhasil)

---

**Catatan**: Jika ada error "Cannot find module" untuk gambar/font, pastikan path sudah benar dan file benar-benar ada di folder `public/`.
