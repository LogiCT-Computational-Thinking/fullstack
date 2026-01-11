# LogiCT Backend - Django REST API

Backend REST API untuk aplikasi LogiCT dengan fitur authentication menggunakan JWT dan Google OAuth.

## Features

- ✅ User Registration (Email & Password)
- ✅ User Login (Email & Password)
- ✅ Google Sign-In OAuth
- ✅ JWT Token Authentication
- ✅ Token Refresh & Blacklist
- ✅ User Profile Management
- ✅ CORS Configuration
- ✅ MySQL Database

## Tech Stack

- Django 4.2.25
- Django REST Framework
- Simple JWT
- Google OAuth 2.0
- MySQL/MariaDB
- CORS Headers

## Installation

### 1. Activate Virtual Environment

```bash
# Windows PowerShell
cd C:\Users\Acer\Documents\LogiCT
.\venv\Scripts\Activate.ps1

# Navigate to project
cd myproject
```

### 2. Install Dependencies

```bash
pip install -r ../requirements.txt
```

Or install manually:
```bash
pip install Django==4.2.25
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install google-auth
pip install google-auth-oauthlib
pip install google-auth-httplib2
pip install PyMySQL
pip install python-decouple
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update:
```env
GOOGLE_OAUTH_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-actual-client-secret
```

### 4. Update Settings

Edit `myproject/settings.py` and update Google OAuth credentials:
```python
GOOGLE_OAUTH_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH_CLIENT_SECRET = 'your-client-secret'
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

Server akan berjalan di: `http://localhost:8000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login with email/password | No |
| POST | `/api/auth/google/` | Login with Google OAuth | No |
| POST | `/api/auth/logout/` | Logout (blacklist token) | Yes |
| POST | `/api/auth/refresh/` | Refresh access token | Yes |
| GET | `/api/auth/profile/` | Get user profile | Yes |
| PUT/PATCH | `/api/auth/profile/update/` | Update user profile | Yes |

Lihat [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk detail lengkap.

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang sudah ada
3. Enable **Google+ API**

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure OAuth consent screen:
   - User Type: External
   - App name: LogiCT
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: LogiCT Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:3000`
5. Copy **Client ID** and **Client Secret**

### 3. Update Backend Configuration

Update `settings.py`:
```python
GOOGLE_OAUTH_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH_CLIENT_SECRET = 'your-client-secret'
```

## Database Configuration

Default database settings (MySQL):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'logict',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

Pastikan:
- MySQL/MariaDB sudah running
- Database `logict` sudah dibuat
- MariaDB versi 10.4+ atau MySQL 5.7+

## Testing API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "role": "student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import collection dari `API_DOCUMENTATION.md`
2. Set environment variable:
   - `base_url`: `http://localhost:8000`
   - `access_token`: (dari response login/register)

## Frontend Integration

### React Example

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          role: 'student'
        }),
      });
      
      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="your-client-id.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Login Failed')}
      />
    </GoogleOAuthProvider>
  );
}
```

### Making Authenticated Requests

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('http://localhost:8000/api/auth/profile/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const userData = await response.json();
```

## Project Structure

```
myproject/
├── core/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── authentication.py    # Custom JWT authentication
│   ├── models.py            # User, Course, Quiz models
│   ├── serializers.py       # DRF serializers
│   ├── urls.py              # API routes
│   └── views.py             # API views
├── myproject/
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL config
│   └── wsgi.py
├── manage.py
├── .env.example
├── API_DOCUMENTATION.md
└── README.md
```

## Troubleshooting

### Django Import Error
```
ImportError: Couldn't import Django
```
**Solution:** Pastikan virtual environment sudah diaktifkan
```bash
.\venv\Scripts\Activate.ps1
```

### MariaDB Version Error
```
MariaDB 10.5 or later is required (found 10.4.32)
```
**Solution:** Sudah fixed dengan downgrade Django ke 4.2.25

### Google OAuth Error
```
Invalid Google token
```
**Solution:** 
- Pastikan Client ID sudah benar di settings.py
- Pastikan token dari frontend masih valid
- Check authorized origins di Google Console

### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:** Pastikan frontend URL sudah ditambahkan di `CORS_ALLOWED_ORIGINS` di settings.py

## Next Steps

1. ✅ Setup Google OAuth credentials
2. ✅ Test all API endpoints
3. 🔄 Integrate with frontend
4. 🔄 Add more API endpoints (courses, quizzes, etc.)
5. 🔄 Add unit tests
6. 🔄 Deploy to production

## Support

Jika ada pertanyaan atau masalah, silakan buat issue atau hubungi developer.

## License

MIT License
