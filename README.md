# ระบบแพลตฟอร์มจำหน่ายและจัดการเกมดิจิทัล

Digital Game Sales and Management Platform System
ปริญญานิพนธ์ สาขาวิศวกรรมคอมพิวเตอร์ วิทยาลัยวิศวกรรมศาสตร์ มหาวิทยาลัยรังสิต ปีการศึกษา 2569

- ณัฐชนน นกแก้ว (6602034)
- สุวิจักขณ์ ศรีโชคไพศาล (6610568)

อาจารย์ที่ปรึกษา: อาจารย์จิรวุฒิ สินธุวณิชเศรษฐ์

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite + React Router |
| Backend | Node.js + Express + TypeScript |
| ฐานข้อมูล | PostgreSQL + Prisma ORM |
| ยืนยันตัวตน | JWT + bcrypt |
| Deploy | Vercel (frontend), Railway + AWS S3 (backend) |

## สิ่งที่ต้องติดตั้งก่อน

1. [Node.js LTS](https://nodejs.org) — เช็กด้วย `node -v`
2. [Git](https://git-scm.com)
3. [PostgreSQL](https://www.postgresql.org/download/windows/) — จดรหัสผ่านของ user `postgres` ไว้
4. [Visual Studio Code](https://code.visualstudio.com) — เปิดโปรเจกต์แล้วกดติดตั้ง extension ที่แนะนำ

## วิธีรันครั้งแรก

```bash
git clone <URL ของ repo>
cd game-platform
```

### 1. ฐานข้อมูล

สร้างฐานข้อมูลชื่อ `gameplatform` ใน pgAdmin หรือสั่ง:

```bash
psql -U postgres -c "CREATE DATABASE gameplatform;"
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env      # macOS/Linux ใช้: cp .env.example .env
# แก้ .env ใส่รหัสผ่าน Postgres ของเครื่องตัวเอง และตั้ง JWT_SECRET
npx prisma migrate dev --name init
npm run seed                # ข้อมูลทดสอบ (รหัสผ่านทุกบัญชี: password123)
npm run dev                 # http://localhost:4000
```

### 3. Frontend (เปิด terminal ใหม่อีกอัน)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## บัญชีทดสอบ

| บทบาท | อีเมล | รหัสผ่าน |
| --- | --- | --- |
| Admin | admin@example.com | password123 |
| Player | player@example.com | password123 |
| Developer | dev@example.com | password123 |

## โครงสร้างโปรเจกต์

```
game-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # โครงฐานข้อมูล (ใช้ร่วมกันทั้งทีม — แก้แล้วต้องบอกอีกคน)
│   │   └── seed.ts
│   └── src/
│       ├── server.ts         # จุดเริ่มต้นของ API
│       ├── lib/              # prisma client, env, การอัปโหลดไฟล์
│       ├── middleware/auth.ts# JWT + การตรวจสิทธิ์ตามบทบาท
│       └── routes/           # auth, games, cart, orders, library, reviews, admin
└── frontend/
    └── src/
        ├── lib/api.ts        # ตัวกลางเรียก API ตัวเดียวของทั้งแอป
        └── pages/            # หน้าจอต่าง ๆ
```

## รายการ API

| Method | Path | ใครเรียกได้ |
| --- | --- | --- |
| POST | `/api/auth/register` | ทุกคน |
| POST | `/api/auth/login` | ทุกคน |
| GET | `/api/auth/me` | ล็อกอินแล้ว |
| GET | `/api/games` | ทุกคน (guest) |
| GET | `/api/games/:slug` | ทุกคน (guest) |
| POST | `/api/games` | Developer (อนุมัติแล้ว) |
| GET | `/api/games/mine/list` | Developer |
| PATCH | `/api/games/:id` | Developer (เจ้าของเกม) |
| POST/DELETE | `/api/games/:id/cover` | Developer (เจ้าของเกม) |
| POST | `/api/games/:id/screenshots` | Developer (เจ้าของเกม) |
| DELETE | `/api/games/:id/screenshots/:shotId` | Developer (เจ้าของเกม) |
| POST/DELETE | `/api/games/:id/video` | Developer (เจ้าของเกม) |
| GET | `/api/media/:file` | ทุกคน (ภาพหน้าปก ภาพหน้าจอ วิดีโอ) |
| GET/POST/DELETE | `/api/cart` | Player |
| GET/POST/DELETE | `/api/wishlist` | Player |
| POST | `/api/orders/checkout` | Player |
| GET | `/api/orders` | Player |
| GET | `/api/library` | Player |
| GET | `/api/library/:gameId/download` | เจ้าของสิทธิ์ |
| POST | `/api/reviews` | Player (ต้องมีเกมในคลัง) |
| POST | `/api/reviews/:id/reply` | Developer / Admin |
| GET | `/api/admin/games/pending` | Admin |
| PATCH | `/api/admin/games/:id/review` | Admin |
| PATCH | `/api/admin/developers/:id/review` | Admin |
| GET | `/api/admin/stats` | Admin |

## การทำงานร่วมกัน (Git workflow)

ห้าม commit ลง `main` ตรง ๆ แยก branch ต่อหนึ่งฟีเจอร์:

```bash
git checkout main
git pull                       # ดึงงานล่าสุดก่อนเริ่มทุกครั้ง
git checkout -b feature/cart
# ... เขียนโค้ด ...
git add .
git commit -m "เพิ่มหน้าตะกร้าสินค้า"
git push -u origin feature/cart
```

แล้วเข้า GitHub กด **Compare & pull request** → ให้อีกคนรีวิว → **Merge** เข้า `main`

**ข้อตกลงของทีม**

- ถ้าแก้ `prisma/schema.prisma` ต้องบอกอีกคนทันที อีกฝ่ายต้อง `git pull` แล้วรัน `npx prisma migrate dev`
- ห้าม commit ไฟล์ `.env` (ถูก ignore ไว้แล้ว) ถ้าเพิ่มตัวแปรใหม่ ให้เพิ่มชื่อไว้ใน `.env.example` ด้วย
- แบ่งงานตามโฟลเดอร์เพื่อลด conflict เช่น คนหนึ่งทำฝั่ง Player (ร้านค้า/ตะกร้า/ชำระเงิน/คลังเกม) อีกคนทำฝั่ง Developer dashboard + Admin

## งานที่ยังเหลือ (TODO)

- [ ] หน้าตะกร้า / ชำระเงิน / รายละเอียดเกม / แดชบอร์ดผู้พัฒนา / หน้าแอดมิน
- [ ] การดาวน์โหลดไฟล์เกมยังเป็น `<a href>` ธรรมดา ซึ่งไม่ส่ง JWT ไปด้วย — ต้องเปลี่ยนไปใช้ signed download URL หรือ fetch + blob
- [ ] อัปโหลดรูปภาพ/ภาพหน้าจอเกม และย้ายที่เก็บไฟล์ไป AWS S3
- [ ] หน้าสมัครสมาชิก และ context เก็บสถานะผู้ใช้ฝั่ง React
- [ ] เขียนชุดทดสอบกระบวนการแบบครบวงจร (อัปโหลด → อนุมัติ → สั่งซื้อ → License Key → ดาวน์โหลด)
