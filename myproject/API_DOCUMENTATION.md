# LogiCT Backend API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Register (Regular)
**POST** `/api/auth/register/`

Register a new user with email and password.

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

**Response (201 Created):**
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
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Validation:**
- `name`: Required, max 100 characters
- `email`: Required, must be valid email, must be unique
- `password`: Required, min 6 characters
- `password_confirm`: Required, must match password
- `role`: Required, choices: "student", "teacher", "admin"

---

### 2. Login (Regular)
**POST** `/api/auth/login/`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profilePicture": null
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Google Sign-In
**POST** `/api/auth/google/`

Authenticate using Google OAuth token.

**Request Body:**
```json
{
  "token": "google-id-token-from-frontend",
  "role": "student"
}
```

**Response (200 OK):**
```json
{
  "message": "Google authentication successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profilePicture": "https://lh3.googleusercontent.com/..."
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "is_new_user": true
}
```

**Notes:**
- If user doesn't exist, a new account will be created
- `role` is optional, defaults to "student"
- Profile picture is automatically fetched from Google

---

### 4. Logout
**POST** `/api/auth/logout/`

Logout by blacklisting the refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 5. Refresh Token
**POST** `/api/auth/refresh/`

Get a new access token using refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 6. Get User Profile
**GET** `/api/auth/profile/`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "profilePicture": "https://lh3.googleusercontent.com/..."
}
```

---

### 7. Update User Profile
**PUT/PATCH** `/api/auth/profile/update/`

Update current user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "profilePicture": "https://example.com/new-picture.jpg"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "role": "student",
    "profilePicture": "https://example.com/new-picture.jpg"
  }
}
```

---

## Setup Google OAuth

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
7. Copy Client ID and Client Secret

### 2. Update Backend Settings

Update `settings.py`:
```python
GOOGLE_OAUTH_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH_CLIENT_SECRET = 'your-client-secret'
```

### 3. Frontend Integration (React Example)

Install Google OAuth library:
```bash
npm install @react-oauth/google
```

Setup in your React app:
```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="your-client-id.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
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
          // Store tokens in localStorage
          localStorage.setItem('access_token', data.tokens.access);
          localStorage.setItem('refresh_token', data.tokens.refresh);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </GoogleOAuthProvider>
  );
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "detail": {
    "field_name": ["Error message"]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "detail": "Error message"
}
```

---

## Token Lifecycle

1. **Access Token**: Valid for 1 day
2. **Refresh Token**: Valid for 7 days
3. When access token expires, use refresh token to get new access token
4. When refresh token expires, user must login again

---

## Testing with cURL

### Register:
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

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile:
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

1. Run migrations to update database schema
2. Install required packages
3. Configure Google OAuth credentials
4. Test endpoints using Postman or cURL
5. Integrate with frontend
