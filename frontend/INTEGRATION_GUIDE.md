# Frontend-Backend Integration Guide

## Step 1: Install Required Packages

```bash
cd C:\Users\Acer\Documents\LogiCT\frontend
npm install @react-oauth/google
```

## Step 2: Files to Create/Update

1. `src/services/api.js` - Axios configuration
2. `src/services/authService.js` - Authentication service
3. `src/context/AuthContext.jsx` - Auth context provider
4. `src/pages/Login.jsx` - Update with Google OAuth
5. `src/pages/Register.jsx` - Update with backend integration
6. `src/main.jsx` - Add GoogleOAuthProvider

## Step 3: Environment Variables

Create `.env` file in frontend root:
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=328574145642-9go5mo6nh18nl739bco05871p4vrqgh2.apps.googleusercontent.com
```

## Step 4: Run Both Servers

Terminal 1 (Backend):
```bash
cd C:\Users\Acer\Documents\LogiCT
.\venv\Scripts\Activate.ps1
cd myproject
python manage.py runserver
```

Terminal 2 (Frontend):
```bash
cd C:\Users\Acer\Documents\LogiCT\frontend
npm run dev
```

Backend: http://127.0.0.1:8000
Frontend: http://localhost:5173
