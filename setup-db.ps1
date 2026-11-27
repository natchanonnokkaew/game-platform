# ตั้งค่าฐานข้อมูล PostgreSQL ให้โปรเจกต์ (สร้างฐานข้อมูล + ตาราง + ข้อมูลตั้งต้น) ในคำสั่งเดียว
#
# วิธีใช้: เปิด PowerShell ในโฟลเดอร์ game-platform แล้วสั่ง
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\setup-db.ps1
#
# สคริปต์จะถามรหัสผ่านของผู้ใช้ postgres (ที่ตั้งตอนติดตั้ง PostgreSQL) แล้ว
#   1. ตรวจว่าเชื่อมต่อ PostgreSQL ได้
#   2. สร้างฐานข้อมูล gameplatform (ถ้ายังไม่มี)
#   3. เขียน DATABASE_URL และ JWT_SECRET ลง backend\.env (ไฟล์นี้ไม่ขึ้น GitHub)
#   4. npm install -> prisma migrate (สร้างตาราง) -> seed (ใส่ข้อมูลตั้งต้น)

param(
  [string]$PgBin = "$env:USERPROFILE\Desktop\PosgSQL\bin",
  [string]$DbName = "gameplatform",
  [string]$DbUser = "postgres",
  [int]$Port = 5432
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Step($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Fail($text) { Write-Host "  [x] $text" -ForegroundColor Red; Read-Host "กด Enter เพื่อปิดหน้าต่าง" | Out-Null; exit 1 }

Step "หาโปรแกรม psql"
$psql = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psql)) {
  $cmd = Get-Command psql -ErrorAction SilentlyContinue
  if ($cmd) { $psql = $cmd.Source } else { Fail "ไม่พบ psql.exe ที่ $PgBin — ใส่ที่อยู่โฟลเดอร์ bin ของ PostgreSQL ด้วย -PgBin" }
}
Write-Host "  [ok] $psql" -ForegroundColor Green

$secure = Read-Host "รหัสผ่านของผู้ใช้ $DbUser (ที่ตั้งตอนติดตั้ง PostgreSQL)" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
$env:PGPASSWORD = $password

Step "ตรวจการเชื่อมต่อ PostgreSQL"
& $psql -h localhost -p $Port -U $DbUser -d postgres -tAc "SELECT version();" | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "เชื่อมต่อไม่ได้ — ตรวจรหัสผ่าน และดูว่า service postgresql-x64-18 ทำงานอยู่ (Services)" }
Write-Host "  [ok] เชื่อมต่อได้" -ForegroundColor Green

Step "สร้างฐานข้อมูล $DbName"
$exists = & $psql -h localhost -p $Port -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
if ("$exists".Trim() -eq "1") {
  Write-Host "  มีฐานข้อมูล $DbName อยู่แล้ว ใช้ของเดิม" -ForegroundColor Yellow
} else {
  & $psql -h localhost -p $Port -U $DbUser -d postgres -c "CREATE DATABASE $DbName ENCODING 'UTF8';" | Out-Null
  if ($LASTEXITCODE -ne 0) { Fail "สร้างฐานข้อมูลไม่สำเร็จ" }
  Write-Host "  [ok] สร้างแล้ว" -ForegroundColor Green
}

Step "เขียน backend\.env"
$envFile = "backend\.env"
if (-not (Test-Path $envFile)) { Copy-Item "backend\.env.example" $envFile }
$encoded = [uri]::EscapeDataString($password)
$dbUrl = "postgresql://${DbUser}:$encoded@localhost:$Port/${DbName}?schema=public"
$lines = Get-Content $envFile -Encoding UTF8
$lines = $lines | ForEach-Object {
  if ($_ -match '^DATABASE_URL=') { "DATABASE_URL=`"$dbUrl`"" }
  elseif ($_ -match '^JWT_SECRET="?(change-this[^"]*)?"?\s*$') {
    $bytes = New-Object byte[] 48
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    "JWT_SECRET=`"$([Convert]::ToBase64String($bytes))`""
  }
  else { $_ }
}
[IO.File]::WriteAllLines((Resolve-Path $envFile), [string[]]$lines, (New-Object Text.UTF8Encoding($false)))
Write-Host "  [ok] ใส่ DATABASE_URL และ JWT_SECRET แล้ว (ไฟล์ .env ถูก ignore ไม่ขึ้น GitHub)" -ForegroundColor Green
Remove-Item Env:PGPASSWORD

Step "ติดตั้ง dependencies ของ backend"
Push-Location backend
try {
  if (-not (Test-Path "node_modules")) { npm install; if ($LASTEXITCODE -ne 0) { Fail "npm install ไม่สำเร็จ" } }
  else { Write-Host "  มี node_modules แล้ว ข้าม" -ForegroundColor Yellow }

  Step "สร้างตาราง (prisma migrate)"
  if (Test-Path "prisma\migrations") { npx prisma migrate dev }
  else { npx prisma migrate dev --name init }
  if ($LASTEXITCODE -ne 0) { Fail "prisma migrate ไม่สำเร็จ" }

  Step "ใส่ข้อมูลตั้งต้น (seed)"
  npm run seed
  if ($LASTEXITCODE -ne 0) { Fail "seed ไม่สำเร็จ" }
} finally { Pop-Location }

if (-not (Test-Path "frontend\node_modules")) {
  Step "ติดตั้ง dependencies ของ frontend"
  Push-Location frontend; npm install; Pop-Location
}

Write-Host @"

=== เสร็จแล้ว ===

  เปิด backend:   cd backend;  npm run dev    -> http://localhost:4000/api/health
  เปิด frontend:  cd frontend; npm run dev    -> http://localhost:5173

  บัญชีทดสอบ (รหัสผ่าน password123)
    admin@example.com     ผู้ดูแลระบบ
    dev@example.com       ผู้พัฒนา Lotus Forge
    player@example.com    ผู้เล่น
    kinnaree@example.com  ผู้พัฒนาที่รออนุมัติบัญชี

  ดูตารางและข้อมูล:  cd backend; npx prisma studio   (หรือเปิดใน pgAdmin 4)

"@ -ForegroundColor Cyan

Read-Host "กด Enter เพื่อปิดหน้าต่าง" | Out-Null
