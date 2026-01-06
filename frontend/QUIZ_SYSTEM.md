# Sistem Quiz/Pretest LogiCT

## 📋 Overview

Sistem kuis pretest yang muncul setelah login, dengan welcome screen dan progress bar animasi.

## 🎯 Fitur

### 1. Welcome Screen
- **Tampilan**: Burung maskot dengan speech bubble "Welcome to LogiCT!"
- **Animasi**:
  - Speech bubble: fade in + slide up (500ms)
  - Burung: fade in + scale + rotate (700ms)
  - Bounce animation: continuous slow bounce (2s loop)
- **Background**: Gradient hijau lime (#c8e86c → #a8cc4c)
- **Tombol**: "Continue" dengan gradient biru

### 2. Question Screen
- **Layout**: 
  - Pertanyaan di atas (bold, 2xl)
  - 5 pilihan jawaban (rounded cards)
  - Tombol "Continue" di bawah
- **Interaksi**:
  - Klik pilihan → highlight biru + scale up
  - Tombol disabled sampai pilih jawaban
  - Transisi smooth antar soal (300ms fade)

### 3. Progress Bar
- **Posisi**: Top fixed, full width dengan padding
- **Warna**: Orange gradient (#ff9a3c → #ff7a1c)
- **Animasi**: Smooth transition 500ms ease-out
- **Progress**: 0% (welcome) → 20% → 40% → 60% → 80% → 100% (5 soal)

## 🎨 Animasi

### Welcome Screen
```css
- Speech bubble: opacity 0→1, translateY(4px→0), 500ms
- Burung: opacity 0→1, scale(0.5→1), rotate(-12deg→0), 700ms
- Bounce: translateY(0→-10px→0), 2s infinite
```

### Question Transition
```css
- Fade out: opacity 1→0, scale(1→0.95), 300ms
- Fade in: opacity 0→1, scale(0.95→1), 300ms
```

### Button Hover
```css
- Scale: 1→1.02, 300ms
- Shadow: lg→xl, 300ms
```

### Answer Selection
```css
- Border: gray-200→blue-500
- Background: white→blue-50
- Scale: 1→1.02
- Shadow: none→md
```

## 📊 Data Soal

File: `src/pages/Quiz.jsx` → `quizData` array

```javascript
{
  id: number,
  question: string,
  options: string[5],
  correctAnswer: number (0-4)
}
```

### Contoh Soal (5 soal tentang logistik):
1. Kepanjangan SCM
2. Fungsi warehouse
3. Metode pengiriman tercepat
4. Last Mile Delivery
5. Teknologi tracking

## 🔄 Flow

```
Login (/login)
  ↓ submit berhasil
Quiz - Welcome (/quiz)
  ↓ klik "Continue"
Quiz - Question 1
  ↓ pilih jawaban + "Continue"
Quiz - Question 2
  ↓ ...
Quiz - Question 5
  ↓ klik "Selesai"
Dashboard (/dashboard)
  + state: { quizCompleted: true, score: X, total: 5 }
```

## 🎯 State Management

```javascript
- currentStep: 'welcome' | 'quiz'
- currentQuestion: 0-4
- selectedAnswer: null | 0-4
- answers: number[] (array jawaban user)
- isAnimating: boolean (untuk transisi)
```

## 📁 File Structure

```
src/
├── pages/
│   └── Quiz.jsx
│       ├── Quiz (main component)
│       ├── WelcomeScreen (sub-component)
│       └── QuestionScreen (sub-component)
├── index.css
│   └── @keyframes bounce-slow
└── App.jsx
    └── Route /quiz
```

## 🎨 Color Palette

- **Background**: Gradient lime green (#c8e86c → #a8cc4c)
- **Card**: White (#ffffff) dengan shadow-2xl
- **Progress Bar**: Orange (#ff9a3c → #ff7a1c)
- **Button Primary**: Blue gradient (#3b82f6 → #2563eb)
- **Selected Answer**: Blue-50 background + blue-500 border
- **Text**: Gray-900 (heading), Gray-700 (body)

## 🚀 Cara Menggunakan

### 1. Jalankan dev server
```bash
npm run dev
```

### 2. Test flow
- Login di `/` → otomatis redirect ke `/quiz`
- Atau akses langsung `/quiz`

### 3. Customize soal
Edit array `quizData` di `src/pages/Quiz.jsx`:
```javascript
const quizData = [
  {
    id: 1,
    question: "Pertanyaan Anda?",
    options: ["A", "B", "C", "D", "E"],
    correctAnswer: 0 // index jawaban benar
  },
  // ... tambah soal
];
```

## 📊 Scoring

Setelah quiz selesai:
- Hitung jawaban benar
- Redirect ke `/dashboard` dengan state:
  ```javascript
  {
    quizCompleted: true,
    score: 4,        // jumlah benar
    total: 5         // total soal
  }
  ```

Dashboard bisa menampilkan hasil dengan:
```javascript
const location = useLocation();
const { quizCompleted, score, total } = location.state || {};
```

## 🎭 Animasi Custom

### Bounce Slow (di index.css)
```css
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
```

## 🖼️ Assets

- **Logo**: `/images/logo-logict.png` (header)
- **Burung**: `/images/Burung_Thinking_1.png` (welcome screen)

## ✅ Checklist Implementasi

- [x] Welcome screen dengan animasi burung
- [x] Speech bubble dengan pointer
- [x] Progress bar dengan animasi smooth
- [x] 5 soal multiple choice
- [x] Transisi antar soal dengan fade
- [x] Answer selection dengan highlight
- [x] Button disabled state
- [x] Scoring system
- [x] Redirect ke dashboard dengan hasil
- [x] Responsive design
- [x] Custom animations

## 🔧 Customization

### Ubah jumlah soal
Edit `quizData` array (tambah/kurangi object)

### Ubah warna background
```jsx
className="bg-gradient-to-br from-[#WARNA1] to-[#WARNA2]"
```

### Ubah durasi animasi
```jsx
// Transisi soal
setTimeout(() => { ... }, 300); // ubah 300ms

// Bounce speed
animation: bounce-slow 2s ... // ubah 2s
```

### Ubah progress bar color
```jsx
className="bg-gradient-to-r from-orange-400 to-orange-500"
// ganti orange dengan warna lain
```

---

**Catatan**: Quiz ini adalah pretest sederhana. Untuk production, tambahkan:
- Timer per soal
- Shuffle options
- Kategori soal
- Review jawaban
- Leaderboard
- Save progress ke backend
