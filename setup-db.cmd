@echo off
rem ดับเบิลคลิกไฟล์นี้เพื่อตั้งค่าฐานข้อมูล (เรียก setup-db.ps1)
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-db.ps1"
