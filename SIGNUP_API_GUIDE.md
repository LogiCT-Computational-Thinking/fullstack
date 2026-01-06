# LogiCT Backend - Sign Up API Guide

## ✅ Status: READY TO USE

Backend API untuk Sign Up sudah siap dan terintegrasi dengan frontend!

---

## 🚀 Cara Menjalankan Backend Server

### 1. **Aktifkan Virtual Environment**
```powershell
cd c:\Users\Acer\Documents\LogiCT\myproject
.\.venv\Scripts\activate
```

### 2. **Jalankan Server**
```powershell
python manage.py runserver
```

Server akan berjalan di: **http://127.0.0.1:8000/**

---

## 📝 API Endpoints untuk Sign Up

### **Method 1: Sign Up Manual (Mengisi Form)**

**Endpoint:** `POST /api/auth/register/`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "role": "student"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profilePicture": null
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### **Method 2: Sign Up dengan Google OAuth**

**Endpoint:** `POST /api/auth/google/`

**Request Body:**
```json
{
  "token": "google-credential-token-from-frontend",
  "role": "student"
}
```

**Response (Success):**
```json
{
  "message": "Google authentication successful",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "student",
    "profilePicture": "https://lh3.googleusercontent.com/..."
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "is_new_user": true
}
```

**Catatan:** 
- Jika `is_new_user: true` → User baru dibuat
- Jika `is_new_user: false` → User sudah ada, langsung login
- **Nama otomatis diambil dari Google account!**

---

## 🔧 Frontend Integration

Frontend sudah siap dan terintegrasi di:

### **Register Page:**
- Path: `/register`
- File: `frontend/src/pages/Register.jsx`

### **Fitur yang tersedia:**
1. ✅ Form manual dengan field: First Name, Last Name, Email, Password
2. ✅ Google Sign Up button
3. ✅ Remember me checkbox
4. ✅ Link ke halaman Login
5. ✅ Validasi form
6. ✅ Error handling
7. ✅ Loading states
8. ✅ Responsive design (Mobile & Desktop)

### **AuthService:**
```javascript
// Manual Registration
await authService.register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  password_confirm: "password123",
  role: "student"
});

// Google Sign Up
await authService.googleLogin(googleCredential, 'student');
```

---

## 🧪 Cara Testing Sign Up

### **Test 1: Sign Up Manual**
1. Buka browser: http://localhost:5173/register
2. Isi form:
   - First Name: `Rio`
   - Last Name: `Alvein`
   - E-mail: `rio@example.com`
   - Password: `password123`
3. Centang "Remember me" (optional)
4. Click tombol **"Sign up"**
5. Jika berhasil, akan redirect ke `/quiz`

### **Test 2: Sign Up dengan Google**
1. Buka browser: http://localhost:5173/register
2. Click tombol **"Sign up with Google"**
3. Pilih akun Google
4. Nama akan otomatis diambil dari akun Google
5. Jika berhasil, akan redirect ke `/quiz`

---

## 📊 Database

User akan tersimpan di database dengan struktur:

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary Key (Auto) |
| name | String | Nama lengkap user |
| email | String | Email (Unique) |
| password | String | Hashed password (kosong untuk Google auth) |
| role | String | student/teacher/admin |
| profilePicture | URL | URL foto profil (dari Google) |
| is_active | Boolean | Status aktif user |
| created_at | DateTime | Waktu registrasi |

---

## ⚠️ Troubleshooting

### **Error: "Email already registered"**
- Artinya: Email sudah terdaftar
- Solusi: Gunakan email lain atau login dengan email tersebut

### **Error: "Passwords do not match"**
- Artinya: Password dan confirm password tidak sama
- Solusi: Pastikan kedua password sama

### **Error: Google login failed**
- Artinya: Token Google invalid atau expired
- Solusi: Coba login ulang atau refresh page

### **Error: CORS blocked**
- Artinya: Frontend dan backend tidak terhubung
- Solusi: Pastikan backend server berjalan di `http://127.0.0.1:8000`

---

## 🔒 Security Features

1. ✅ Password di-hash dengan bcrypt
2. ✅ JWT token untuk authentication
3. ✅ Email validation (unique)
4. ✅ Password minimum 6 characters
5. ✅ CORS enabled untuk frontend
6. ✅ Google OAuth token verification

---

## 📌 Important Notes

1. **Nama dari Google**: Ketika sign up dengan Google, nama otomatis diambil dari akun Google (field `name` di Google profile)

2. **Password untuk Google Auth**: User yang sign up dengan Google tidak memiliki password, jadi hanya bisa login dengan Google

3. **Token Storage**: Token disimpan di `localStorage`:
   - `access_token`: Token untuk API requests
   - `refresh_token`: Token untuk refresh access token
   - `user`: Data user dalam JSON

4. **Auto Login**: Setelah sign up (manual atau Google), user langsung login otomatis

---

## ✅ Ready to Test!

Jalankan kedua server:
1. **Backend**: `python manage.py runserver` (Port 8000)
2. **Frontend**: `npm run dev` (Port 5173)

Buka browser dan test sign up di: **http://localhost:5173/register**

Good luck! 🚀
