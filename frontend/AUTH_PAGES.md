# Halaman Autentikasi - Login & Register

## 📄 File yang Dibuat

### 1. Login Page (`src/pages/Login.jsx`)
- **Route**: `/`
- **Fitur**:
  - Form login (Username + Password)
  - Checkbox "Remember me"
  - Link "Lupa Kata Sandi?"
  - Tombol "Login" dengan gradient biru
  - Divider "atau"
  - Tombol "Masuk dengan Google" (dengan logo Google)
  - Link "Belum punya akun? **Daftar**" → ke `/register`

### 2. Register Page (`src/pages/Register.jsx`)
- **Route**: `/register`
- **Fitur**:
  - Form registrasi:
    - Nama Lengkap
    - Email
    - Username
    - Password
    - Konfirmasi Password
  - Checkbox "Saya setuju dengan Syarat & Ketentuan"
  - Tombol "Daftar" dengan gradient biru
  - Divider "atau"
  - Tombol "Daftar dengan Google" (dengan logo Google)
  - Link "Sudah punya akun? **Masuk**" → ke `/`

## 🎨 Desain

- **Layout**: 50% form (kiri) | 50% ilustrasi (kanan)
- **Responsive**: Mobile stack vertikal (ilustrasi di atas)
- **Font**: Graphik Web dengan fallback ke Inter
- **Button Primary**: Gradient #1d9bf0 → #1877f2
- **Button Google**: White dengan border, logo Google warna asli
- **Input**: Rounded 14px, subtle shadow, blue focus ring

## 🔗 Navigasi

```
/ (Login)
  ↓ klik "Daftar"
/register (Register)
  ↓ klik "Masuk"
/ (Login)
  ↓ submit login berhasil
/dashboard (Dashboard dengan sidebar)
```

## 🚀 Cara Menggunakan

1. **Jalankan dev server**:
   ```bash
   npm run dev
   ```

2. **Akses halaman**:
   - Login: `http://localhost:5173/`
   - Register: `http://localhost:5173/register`

3. **Navigasi**:
   - Dari Login → klik "Daftar" → ke Register
   - Dari Register → klik "Masuk" → ke Login

## 🔧 Implementasi Google Sign In

Kedua halaman sudah memiliki handler `handleGoogleSignIn()` yang siap diintegrasikan:

```javascript
const handleGoogleSignIn = () => {
  // TODO: Implement Google Sign In
  // Gunakan library seperti @react-oauth/google atau firebase
  console.log('Google Sign In clicked');
};
```

### Rekomendasi Library:
- **Firebase Auth**: `firebase/auth` dengan `signInWithPopup()`
- **Google OAuth**: `@react-oauth/google`
- **NextAuth.js**: Jika migrasi ke Next.js

## ✅ Checklist

- [x] Halaman Login dengan form lengkap
- [x] Halaman Register dengan form lengkap
- [x] Tombol Google Sign In di kedua halaman
- [x] Link navigasi antar halaman
- [x] Layout 50-50 responsive
- [x] Styling sesuai mockup
- [x] Routing terintegrasi di App.jsx

## 📝 Catatan

- Form validation belum diimplementasi (tambahkan sesuai kebutuhan)
- Google Sign In masih placeholder (perlu integrasi dengan OAuth provider)
- Password strength indicator bisa ditambahkan di Register
- Email verification flow belum ada
