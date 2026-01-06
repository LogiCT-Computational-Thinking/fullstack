# 🔄 Migrasi Database dari SQLite ke MySQL

## ✅ Step 1: Install mysqlclient

Buka terminal di folder myproject dan jalankan:

```powershell
cd c:\Users\Acer\Documents\LogiCT\myproject
.\.venv\Scripts\activate
pip install mysqlclient
```

**Catatan:** Jika ada error saat install mysqlclient, install dulu Visual C++ Build Tools atau gunakan:
```powershell
pip install pymysql
```

Jika pakai pymysql, tambahkan di `myproject/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

---

## ✅ Step 2: Buat Database di MySQL

Buka **PHPMyAdmin** atau **MySQL Command Line** dan jalankan:

```sql
CREATE DATABASE logict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Atau via command line:**
```powershell
mysql -u root -p
```

Kemudian ketik:
```sql
CREATE DATABASE logict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

---

## ✅ Step 3: Update .env File (Jika perlu)

File `.env` sudah punya konfigurasi MySQL:
```
DB_NAME=logict
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
```

**Jika password MySQL Anda ada**, update `DB_PASSWORD`:
```
DB_PASSWORD=your_mysql_password
```

---

## ✅ Step 4: Stop Server Django

1. Tekan `Ctrl + C` di terminal yang menjalankan `python manage.py runserver`
2. Server akan berhenti

---

## ✅ Step 5: Run Migrations

Jalankan perintah ini untuk membuat tabel di MySQL:

```powershell
cd c:\Users\Acer\Documents\LogiCT\myproject
.\.venv\Scripts\activate
python manage.py migrate
```

Output yang diharapkan:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying core.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  ...
```

---

## ✅ Step 6: (Optional) Transfer Data dari SQLite ke MySQL

Jika Anda sudah punya data di SQLite dan ingin transfer ke MySQL:

### 6.1. Export data dari SQLite

Pertama, ubah dulu `settings.py` kembali ke SQLite sementara:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Export data:
```powershell
python manage.py dumpdata > data_backup.json
```

### 6.2. Import data ke MySQL

Ubah `settings.py` kembali ke MySQL, kemudian:
```powershell
python manage.py loaddata data_backup.json
```

---

## ✅ Step 7: Buat Superuser untuk Django Admin

```powershell
python manage.py createsuperuser
```

Isi:
- **Email address**: admin@example.com
- **Name**: Admin User
- **Password**: (password yang kuat)
- **Password (again)**: (ulangi password)

---

## ✅ Step 8: Restart Server

```powershell
python manage.py runserver
```

---

## ✅ Step 9: Verifikasi di PHPMyAdmin

1. Buka **PHPMyAdmin**: http://localhost/phpmyadmin
2. Pilih database **`logict`**
3. Anda akan melihat tabel-tabel berikut:
   - `auth_group`
   - `auth_group_permissions`
   - `auth_permission`
   - `core_user` ← **Data user ada di sini!**
   - `core_course`
   - `core_module`
   - `core_quiz`
   - `core_enrollment`
   - `core_pretest`
   - `core_pretestquestion`
   - `core_pretestresponse`
   - `core_quizquestion`
   - `core_quizresponse`
   - `core_feedback`
   - `core_hints`
   - `django_admin_log`
   - `django_content_type`
   - `django_migrations`
   - `django_session`

---

## 📊 Struktur Tabel `core_user` di MySQL

| Column | Type | Attributes |
|--------|------|-----------|
| id | bigint(20) | PRIMARY KEY, AUTO_INCREMENT |
| name | varchar(100) | NOT NULL |
| email | varchar(254) | NOT NULL, UNIQUE |
| password | varchar(255) | NOT NULL |
| role | varchar(20) | NOT NULL |
| profilePicture | varchar(200) | NULL |
| preferences | longtext | NULL |
| is_active | tinyint(1) | NOT NULL, DEFAULT 1 |
| is_staff | tinyint(1) | NOT NULL, DEFAULT 0 |
| is_superuser | tinyint(1) | NOT NULL, DEFAULT 0 |
| last_login | datetime(6) | NULL |
| created_at | datetime(6) | NULL |
| updated_at | datetime(6) | NULL |

---

## 🎯 Test Sign Up & Cek di PHPMyAdmin

### 1. Test Sign Up di Frontend

Buka: http://localhost:5173/register

Isi form:
- First Name: `Test`
- Last Name: `User`
- Email: `test@example.com`
- Password: `password123`

Click **"Sign up"**

### 2. Cek di PHPMyAdmin

1. Buka PHPMyAdmin
2. Database `logict` → Table `core_user`
3. Click **Browse**
4. Anda akan melihat data user yang baru sign up!

---

## 🚨 Troubleshooting

### Error: "No module named 'MySQLdb'"
**Solusi:**
```powershell
pip install mysqlclient
```

Atau gunakan pymysql:
```powershell
pip install pymysql
```

Dan tambahkan di `myproject/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Error: "Access denied for user 'root'@'localhost'"
**Solusi:** Password MySQL salah, update di `.env`:
```
DB_PASSWORD=your_correct_password
```

### Error: "Unknown database 'logict'"
**Solusi:** Database belum dibuat, jalankan:
```sql
CREATE DATABASE logict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Can't connect to MySQL server"
**Solusi:** 
- Pastikan MySQL/XAMPP running
- Cek di `services.msc` apakah MySQL service berjalan
- Atau start XAMPP Control Panel → Start MySQL

---

## ✅ Verifikasi MySQL Connection

Test koneksi MySQL dengan command ini:

```powershell
python manage.py dbshell
```

Jika berhasil, Anda akan masuk ke MySQL prompt:
```
mysql>
```

Coba query:
```sql
SHOW TABLES;
SELECT * FROM core_user;
EXIT;
```

---

## 📝 Summary

Setelah migrasi ke MySQL:
- ✅ Data tersimpan di MySQL database `logict`
- ✅ Bisa dilihat di **PHPMyAdmin**
- ✅ Django Admin tetap bisa digunakan di http://127.0.0.1:8000/admin/
- ✅ Semua API endpoints tetap berfungsi normal
- ✅ Frontend sign up/login tetap berfungsi

**File SQLite lama (`db.sqlite3`) bisa dihapus atau di-backup untuk jaga-jaga.**

---

## 🎉 Selesai!

Sekarang LogiCT menggunakan MySQL, dan data user bisa dilihat di **PHPMyAdmin**! 🚀

Untuk sign up user baru, gunakan:
- Frontend: http://localhost:5173/register
- Cek data: PHPMyAdmin → Database `logict` → Table `core_user`
