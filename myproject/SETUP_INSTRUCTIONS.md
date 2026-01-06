# Setup Instructions - LogiCT Backend

## 🚀 Quick Start

### 1. Aktifkan Virtual Environment (PENTING!)

```powershell
# Dari folder LogiCT
cd C:\Users\Acer\Documents\LogiCT
.\venv\Scripts\Activate.ps1

# Pindah ke folder myproject
cd myproject
```

Pastikan Anda melihat `(venv)` di awal prompt terminal.

### 2. Jalankan Migrations

```bash
# Buat migration files untuk perubahan model User
python manage.py makemigrations

# Apply migrations ke database
python manage.py migrate
```

### 3. (Optional) Buat Superuser untuk Admin Panel

```bash
python manage.py createsuperuser
```

### 4. Jalankan Development Server

```bash
python manage.py runserver
```

Server akan berjalan di: **http://localhost:8000**

---

## 📝 Yang Sudah Dibuat

### ✅ Backend Files

1. **`core/serializers.py`** - Serializers untuk API
   - UserSerializer
   - UserRegistrationSerializer
   - UserLoginSerializer
   - GoogleAuthSerializer
   - CourseSerializer, ModuleSerializer, QuizSerializer

2. **`core/views.py`** - API Views
   - `register_view()` - Register dengan email/password
   - `login_view()` - Login dengan email/password
   - `google_auth_view()` - Login dengan Google OAuth
   - `logout_view()` - Logout & blacklist token
   - `user_profile_view()` - Get user profile
   - `update_profile_view()` - Update user profile
   - `refresh_token_view()` - Refresh access token

3. **`core/urls.py`** - API Routes
   - `/api/auth/register/`
   - `/api/auth/login/`
   - `/api/auth/google/`
   - `/api/auth/logout/`
   - `/api/auth/refresh/`
   - `/api/auth/profile/`
   - `/api/auth/profile/update/`

4. **`core/authentication.py`** - Custom JWT Authentication

5. **`myproject/settings.py`** - Updated dengan:
   - REST Framework configuration
   - JWT settings
   - CORS configuration
   - Google OAuth settings

### ✅ Model Changes

**User Model** ditambahkan fields:
- `password` - Untuk authentication
- `profilePicture` - URL foto profil
- `is_active` - Status aktif user
- `created_at` - Timestamp pembuatan
- `updated_at` - Timestamp update terakhir

### ✅ Documentation

1. **`API_DOCUMENTATION.md`** - Dokumentasi lengkap API endpoints
2. **`README.md`** - Setup guide dan overview
3. **`SETUP_INSTRUCTIONS.md`** - File ini
4. **`.env.example`** - Template environment variables

---

## 🔑 Setup Google OAuth (WAJIB untuk Google Sign-In)

### Step 1: Buat Google Cloud Project

1. Buka https://console.cloud.google.com/
2. Klik **Select a project** → **New Project**
3. Nama project: **LogiCT**
4. Klik **Create**

### Step 2: Enable Google+ API

1. Di sidebar, pilih **APIs & Services** → **Library**
2. Search "Google+ API"
3. Klik dan enable

### Step 3: Configure OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. User Type: **External**
3. Klik **Create**
4. Isi form:
   - App name: `LogiCT`
   - User support email: email Anda
   - Developer contact: email Anda
5. Klik **Save and Continue**
6. Skip Scopes → **Save and Continue**
7. Add test users (email Anda) → **Save and Continue**

### Step 4: Create OAuth 2.0 Client ID

1. **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `LogiCT Web Client`
5. **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://localhost:3000`
6. **Authorized redirect URIs:**
   - `http://localhost:5173`
   - `http://localhost:3000`
7. Klik **Create**
8. **COPY Client ID dan Client Secret**

### Step 5: Update Backend Settings

Edit `myproject/settings.py` (baris 207-208):

```python
GOOGLE_OAUTH_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH_CLIENT_SECRET = 'your-actual-client-secret'
```

Ganti dengan Client ID dan Secret yang Anda copy.

---

## 🧪 Testing API

### Test dengan cURL

**1. Register User:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d "{\"name\": \"Test User\", \"email\": \"test@example.com\", \"password\": \"password123\", \"password_confirm\": \"password123\", \"role\": \"student\"}"
```

**2. Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"password123\"}"
```

Copy `access` token dari response.

**3. Get Profile:**
```bash
curl -X GET http://localhost:8000/api/auth/profile/ -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test dengan Browser

1. Buka http://localhost:8000/admin/ (jika sudah buat superuser)
2. Login dengan superuser credentials
3. Lihat data Users, Courses, dll

---

## 🔗 Integrasi dengan Frontend

### Install Package di Frontend

```bash
cd C:\Users\Acer\Documents\LogiCT\frontend
npm install @react-oauth/google axios
```

### Setup Google OAuth di React

**1. Update `main.jsx` atau `App.jsx`:**

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}
```

**2. Create Auth Service (`src/services/authService.js`):**

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const authService = {
  // Register
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register/`, userData);
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login/`, { email, password });
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Google Login
  googleLogin: async (token, role = 'student') => {
    const response = await axios.post(`${API_URL}/google/`, { token, role });
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = localStorage.getItem('access_token');
    
    try {
      await axios.post(
        `${API_URL}/logout/`,
        { refresh: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  }
};
```

**3. Create Login Component:**

```jsx
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import { useState } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await authService.googleLogin(
        credentialResponse.credential,
        'student'
      );
      console.log('Login success:', data);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      console.log('Login success:', data);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      
      {/* Email/Password Login */}
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Google Login */}
      <div className="google-login">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Failed')}
        />
      </div>
    </div>
  );
}

export default LoginPage;
```

**4. Setup Axios Interceptor (untuk auto-refresh token):**

```javascript
// src/utils/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://localhost:8000/api/auth/refresh/',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## ✅ Checklist

- [ ] Virtual environment diaktifkan
- [ ] Packages terinstall
- [ ] Migrations dijalankan
- [ ] Server berjalan di http://localhost:8000
- [ ] Google OAuth credentials sudah di-setup
- [ ] Test register/login berhasil
- [ ] Frontend sudah diintegrasikan

---

## 🐛 Troubleshooting

### Error: "Couldn't import Django"
**Solusi:** Aktifkan virtual environment
```bash
.\venv\Scripts\Activate.ps1
```

### Error: "Invalid Google token"
**Solusi:** 
- Pastikan GOOGLE_OAUTH_CLIENT_ID di settings.py sudah benar
- Pastikan Client ID di frontend sama dengan di Google Console

### Error: CORS
**Solusi:** Pastikan frontend URL sudah ada di `CORS_ALLOWED_ORIGINS` di settings.py

### Error: Database connection
**Solusi:** 
- Pastikan MySQL/MariaDB running
- Database `logict` sudah dibuat
- Credentials di settings.py benar

---

## 📚 Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [Simple JWT Docs](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

Selamat! Backend API Anda sudah siap digunakan! 🎉
