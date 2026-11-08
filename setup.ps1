# ตั้งค่าโปรเจกต์ครั้งแรก — คลิกขวาที่ไฟล์นี้ใน VS Code แล้วเลือก "Run in Integrated Terminal"
# หรือเปิด PowerShell ในโฟลเดอร์นี้แล้วสั่ง:  .\setup.ps1
#
# ถ้า Windows บล็อกการรันสคริปต์ ให้สั่งบรรทัดนี้ก่อนหนึ่งครั้ง:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "`n=== ตรวจสอบเครื่องมือที่จำเป็น ===" -ForegroundColor Cyan
foreach ($tool in @("git", "node", "npm")) {
  if (Get-Command $tool -ErrorAction SilentlyContinue) {
    Write-Host ("  [ok] {0,-5} {1}" -f $tool, (& $tool --version | Select-Object -First 1)) -ForegroundColor Green
  } else {
    Write-Host "  [x] ไม่พบ $tool — ติดตั้งก่อนแล้วรันสคริปต์นี้อีกครั้ง" -ForegroundColor Red
    exit 1
  }
}

Write-Host "`n=== ตั้งค่า Git ===" -ForegroundColor Cyan
if (-not (git config --global user.name)) {
  $name = Read-Host "ชื่อสำหรับ git commit"
  git config --global user.name $name
}
if (-not (git config --global user.email)) {
  $email = Read-Host "อีเมลสำหรับ git commit (ใช้อีเมลเดียวกับ GitHub)"
  git config --global user.email $email
}
git config --global init.defaultBranch main
Write-Host ("  user.name  = {0}" -f (git config --global user.name))
Write-Host ("  user.email = {0}" -f (git config --global user.email))

if (-not (Test-Path ".git")) {
  Write-Host "`n=== สร้าง repository ===" -ForegroundColor Cyan
  git init -b main
  git add .
  git commit -m "ตั้งโครงโปรเจกต์: React + TypeScript frontend, Express backend, Prisma schema"
  Write-Host "  commit แรกเรียบร้อย" -ForegroundColor Green
} else {
  Write-Host "`n  มี git repository อยู่แล้ว ข้ามขั้นตอนนี้" -ForegroundColor Yellow
}

Write-Host "`n=== ติดตั้ง dependencies ===" -ForegroundColor Cyan
Push-Location backend;  npm install; Pop-Location
Push-Location frontend; npm install; Pop-Location

if (-not (Test-Path "backend\.env")) {
  Copy-Item "backend\.env.example" "backend\.env"
  Write-Host "`n  สร้าง backend\.env แล้ว — เปิดไฟล์นี้ใส่รหัสผ่าน PostgreSQL ของเครื่องตัวเอง" -ForegroundColor Yellow
}

Write-Host @"

=== เสร็จแล้ว ขั้นตอนต่อไป ===

1. แก้ไฟล์  backend\.env  ใส่รหัสผ่าน PostgreSQL และ JWT_SECRET
2. สร้างฐานข้อมูล:   psql -U postgres -c "CREATE DATABASE gameplatform;"
3. สร้างตาราง:       cd backend; npx prisma migrate dev --name init; npm run seed
4. รัน backend:      cd backend;  npm run dev     -> http://localhost:4000
5. รัน frontend:     cd frontend; npm run dev     -> http://localhost:5173

=== เชื่อมต่อ GitHub ===

สร้าง repo ว่างที่ https://github.com/new (ไม่ต้องติ๊ก README) แล้วสั่ง:

  git remote add origin https://github.com/<ชื่อคุณ>/game-platform.git
  git push -u origin main

จากนั้นเชิญเพื่อนที่ Settings -> Collaborators -> Add people

"@ -ForegroundColor Cyan
