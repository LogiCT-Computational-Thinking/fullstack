# LogiCT Frontend

React frontend untuk aplikasi LogiCT Logistics Management System.

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:
- **Node.js** (versi 18 atau lebih baru)
- **npm** atau **yarn**

Download Node.js dari: https://nodejs.org/

## 🛠️ Setup & Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

atau jika menggunakan yarn:

```bash
cd frontend
yarn install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

atau:

```bash
yarn dev
```

Frontend akan berjalan di: **http://localhost:3000**

### 3. Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`

## 📁 Struktur Folder

```
frontend/
├── public/              # Static assets
├── src/
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   └── Customers.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # TailwindCSS configuration
```

## 🔗 Integrasi dengan Django Backend

Frontend sudah dikonfigurasi untuk berkomunikasi dengan Django backend:

- API proxy sudah disetup di `vite.config.js`
- Request ke `/api/*` akan otomatis diarahkan ke `http://localhost:8000`
- Pastikan Django backend sudah berjalan di port 8000

### Contoh API Call:

```javascript
import axios from 'axios'

// GET request
const response = await axios.get('/api/products/')

// POST request
const response = await axios.post('/api/products/', {
  name: 'Product Name',
  price: 99.99
})
```

## 🎨 Features

### Dashboard
- Overview statistik (Products, Customers, Sales, Growth)
- Recent activity feed

### Products
- Daftar produk dengan search
- Tabel dengan informasi lengkap
- Action buttons (Edit, Delete)

### Customers
- Grid view customer cards
- Contact information
- Order count per customer

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Environment Variables

Jika perlu custom API URL, buat file `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## 📝 Notes

- Mock data sudah disediakan untuk development tanpa backend
- UI menggunakan TailwindCSS dengan design modern
- Responsive design untuk mobile & desktop
- Icons dari Lucide React

## 🚦 Next Steps

1. Install Node.js jika belum
2. Run `npm install` di folder frontend
3. Run `npm run dev` untuk start development
4. Buka http://localhost:3000 di browser
5. Pastikan Django backend juga running di port 8000

## 🤝 Integration dengan Django

Untuk menghubungkan dengan Django backend:

1. Pastikan Django CORS sudah disetup
2. Install `django-cors-headers` di Django
3. Tambahkan `'localhost:3000'` ke `CORS_ALLOWED_ORIGINS`
4. API endpoints Django harus dimulai dengan `/api/`

Happy coding! 🎉
