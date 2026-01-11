-- SQL untuk Reset Database setelah User Model diperbaiki
-- Jalankan di PHPMyAdmin: http://localhost/phpmyadmin
-- Tab: SQL

-- 1. Drop database lama
DROP DATABASE IF EXISTS logict;

-- 2. Buat database baru
CREATE DATABASE logict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Selesai! 
-- Sekarang jalankan di terminal PowerShell:
-- 1. python manage.py makemigrations
-- 2. python manage.py migrate  
-- 3. python manage.py createsuperuser
