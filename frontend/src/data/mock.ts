/**
 * ข้อมูลตั้งต้นสำหรับหน้า UI
 *
 * ไฟล์นี้เก็บเฉพาะ "ข้อมูลที่มีอยู่แล้วบนแพลตฟอร์ม" เช่น เกมที่ผู้พัฒนาคนอื่นเคยอัปโหลด
 * และผู้ดูแลระบบอนุมัติไปแล้ว ส่วนข้อมูลที่เกิดจากการใช้งานของผู้ใช้เอง
 * (ตะกร้า คลังเกม คำสั่งซื้อ เกมที่เพิ่งอัปโหลด) อยู่ใน store/shop.tsx ไม่ได้ hardcode ไว้ที่นี่
 *
 * เมื่อต่อ backend แล้วให้เปลี่ยนไปดึงจาก /api/games แทน
 */

export type GameStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Game {
  id: string;
  slug: string;
  title: string;
  genre: string;
  dev: string;
  price: number;
  rating: number;
  reviews: number;
  /** สีพื้นและสีเน้นของภาพปกจำลอง — เมื่อผู้พัฒนาอัปโหลดรูปจริงให้ใช้ coverUrl แทน */
  color: string;
  accent: string;
  coverUrl?: string | null;
  /** ภาพหน้าจอที่ผู้พัฒนาอัปโหลด */
  screenshots: string[];
  /** คลิปวิดีโอแนะนำเกม (ลิงก์ YouTube หรือไฟล์ที่อัปโหลด) */
  videoUrl?: string | null;
  status: GameStatus;
  /** ขนาดไฟล์เกมเป็น MB — 0 หมายถึงยังไม่ได้อัปโหลดไฟล์ */
  sizeMB: number;
  releaseDate: string;
  description: string;
  unitsSold: number;
  /** เหตุผลที่ผู้ดูแลระบบปฏิเสธ (เฉพาะสถานะ REJECTED) */
  rejectNote?: string;
  submittedAt?: string;
}

export const GENRES = [
  "ทั้งหมด",
  "แอ็กชัน",
  "ผจญภัย",
  "RPG",
  "กลยุทธ์",
  "จำลอง",
  "ปริศนา",
  "แข่งรถ",
  "แคชวล",
] as const;

/** บัญชีผู้พัฒนาที่กำลังล็อกอินอยู่ในหน้าแดชบอร์ดผู้พัฒนา */
export const CURRENT_DEV = "Lotus Forge";

const APPROVED_SEED = [
  { id: "g1", slug: "echo-of-siam", title: "Echo of Siam", genre: "RPG", dev: "Lotus Forge", price: 459, rating: 4.9, reviews: 1284, color: "#1A2440", accent: "#FFA94D", sizeMB: 148, releaseDate: "12 ส.ค. 2569", unitsSold: 162, description: "RPG ผจญภัยในอาณาจักรโบราณ สำรวจเมืองริมน้ำ ไขปริศนาวัดร้าง และสร้างทีมของคุณเอง" },
  { id: "g2", slug: "neon-drift", title: "Neon Drift", genre: "แข่งรถ", dev: "Volt Pixel", price: 349, rating: 4.6, reviews: 642, color: "#2A1240", accent: "#FF5FA2", sizeMB: 186, releaseDate: "3 ก.ค. 2569", unitsSold: 318, description: "เกมแข่งรถกลางเมืองนีออน เน้นการดริฟต์และทำเวลาให้ดีที่สุด" },
  { id: "g3", slug: "hollow-lantern", title: "Hollow Lantern", genre: "ผจญภัย", dev: "Moth & Ember", price: 259, rating: 4.8, reviews: 918, color: "#13261F", accent: "#F5C04A", sizeMB: 121, releaseDate: "20 พ.ค. 2569", unitsSold: 540, description: "เกมผจญภัยบรรยากาศมืดสลัว ไขปริศนาในป่าโบราณด้วยแสงจากโคมเพียงดวงเดียว" },
  { id: "g4", slug: "paddy-tactics", title: "Paddy Tactics", genre: "กลยุทธ์", dev: "Rice Bowl Games", price: 199, rating: 4.3, reviews: 221, color: "#253014", accent: "#C8F04A", sizeMB: 92, releaseDate: "8 มิ.ย. 2569", unitsSold: 174, description: "เกมวางแผนผลัดตาบนทุ่งนา จัดทัพและใช้ภูมิประเทศให้เป็นประโยชน์" },
  { id: "g5", slug: "star-courier", title: "Star Courier", genre: "จำลอง", dev: "Orbit Nine", price: 289, rating: 4.5, reviews: 376, color: "#0F2236", accent: "#6EA8FF", sizeMB: 97, releaseDate: "15 เม.ย. 2569", unitsSold: 263, description: "จำลองการเป็นคนส่งของระหว่างดาว บริหารเชื้อเพลิงและเวลาให้ทัน" },
  { id: "g6", slug: "mekong-mysteries", title: "Mekong Mysteries", genre: "ปริศนา", dev: "River Lab", price: 149, rating: 4.7, reviews: 512, color: "#14302F", accent: "#5BD4C4", sizeMB: 64, releaseDate: "2 ก.พ. 2569", unitsSold: 612, description: "เกมปริศนาเล่าเรื่องริมแม่น้ำโขง ไขคดีจากหลักฐานที่ชาวบ้านทิ้งไว้" },
  { id: "g7", slug: "iron-monsoon", title: "Iron Monsoon", genre: "แอ็กชัน", dev: "Storm Anvil", price: 399, rating: 4.2, reviews: 189, color: "#2E1A14", accent: "#FF7A45", sizeMB: 203, releaseDate: "28 ก.ย. 2569", unitsSold: 141, description: "เกมแอ็กชันต่อสู้กลางพายุฝน ใช้อาวุธหนักฝ่าแนวข้าศึก" },
  { id: "g8", slug: "tiny-garden-co-op", title: "Tiny Garden Co-op", genre: "แคชวล", dev: "Sprout Studio", price: 119, rating: 4.4, reviews: 430, color: "#2B2414", accent: "#9BE15D", sizeMB: 58, releaseDate: "11 มี.ค. 2569", unitsSold: 489, description: "เกมปลูกสวนเล่นด้วยกันได้สองคน เน้นผ่อนคลายไม่มีเวลาจำกัด" },
  { id: "g9", slug: "lotus-knight", title: "Lotus Knight", genre: "แอ็กชัน", dev: "Lotus Forge", price: 299, rating: 4.1, reviews: 167, color: "#301528", accent: "#FF8FC7", sizeMB: 134, releaseDate: "30 ต.ค. 2569", unitsSold: 52, description: "เกมแอ็กชันผจญภัย รับบทอัศวินดอกบัวผู้ปกป้องวิหารกลางบึง" },
  { id: "g10", slug: "night-shift-bkk", title: "Night Shift BKK", genre: "จำลอง", dev: "Tuk Tuk Interactive", price: 229, rating: 4.6, reviews: 288, color: "#161A3A", accent: "#B18CFF", sizeMB: 112, releaseDate: "19 ม.ค. 2569", unitsSold: 357, description: "จำลองชีวิตคนขับรถกลางคืนในกรุงเทพ พบผู้โดยสารและเรื่องเล่าต่าง ๆ" },
  { id: "g11", slug: "pixel-krathong", title: "Pixel Krathong", genre: "แคชวล", dev: "Sprout Studio", price: 99, rating: 4.3, reviews: 354, color: "#122838", accent: "#FFD166", sizeMB: 42, releaseDate: "5 พ.ย. 2569", unitsSold: 402, description: "เกมแคชวลลอยกระทงสไตล์พิกเซล ประดิษฐ์กระทงและลอยไปตามสายน้ำ" },
  { id: "g12", slug: "deep-reef-signal", title: "Deep Reef Signal", genre: "ผจญภัย", dev: "Orbit Nine", price: 319, rating: 4.5, reviews: 203, color: "#0C2A33", accent: "#4FD1E8", sizeMB: 176, releaseDate: "24 ส.ค. 2569", unitsSold: 198, description: "สำรวจแนวปะการังลึก ตามหาสัญญาณปริศนาที่ส่งมาจากใต้ทะเล" },
];

const PENDING_SEED = [
  { id: "q1", slug: "temple-runner-dx", title: "Temple Runner DX", genre: "แอ็กชัน", dev: "Lotus Forge", price: 179, color: "#2E1A14", accent: "#FF7A45", sizeMB: 172, submittedAt: "9 พ.ย. 2569", description: "เกมวิ่งหลบสิ่งกีดขวางในโบราณสถาน เก็บเหรียญและทำคะแนนให้ไกลที่สุด" },
  { id: "q2", slug: "rain-garden", title: "Rain Garden", genre: "แคชวล", dev: "Sprout Studio", price: 89, color: "#13261F", accent: "#9BE15D", sizeMB: 88, submittedAt: "9 พ.ย. 2569", description: "เกมจัดสวนในวันฝนตก ฟังเสียงฝนและปลูกต้นไม้ไปเรื่อย ๆ" },
  { id: "q3", slug: "cyber-songkran", title: "Cyber Songkran", genre: "แข่งรถ", dev: "Volt Pixel", price: 259, color: "#2A1240", accent: "#FF5FA2", sizeMB: 194, submittedAt: "8 พ.ย. 2569", description: "แข่งรถสาดน้ำกลางเทศกาลสงกรานต์ในเมืองอนาคต" },
  { id: "q4", slug: "quiet-lighthouse", title: "Quiet Lighthouse", genre: "ปริศนา", dev: "River Lab", price: 129, color: "#0F2236", accent: "#6EA8FF", sizeMB: 45, submittedAt: "7 พ.ย. 2569", description: "เกมปริศนาในประภาคารร้าง ไขรหัสจากบันทึกของผู้ดูแลคนก่อน" },
];

/** เกมตั้งต้นบนแพลตฟอร์ม — อนุมัติแล้ว 12 เกม รอตรวจสอบ 4 เกม ถูกปฏิเสธ 1 เกม */
export const SEED_GAMES: Game[] = [
  ...APPROVED_SEED.map((g) => ({ ...g, status: "APPROVED" as const, coverUrl: null, screenshots: [], videoUrl: null })),
  ...PENDING_SEED.map((g) => ({
    ...g,
    status: "PENDING" as const,
    coverUrl: null,
    screenshots: [],
    videoUrl: null,
    rating: 0,
    reviews: 0,
    unitsSold: 0,
    releaseDate: "—",
  })),
  {
    id: "r1",
    slug: "bell-tower-demo",
    title: "Bell Tower Demo",
    genre: "ผจญภัย",
    dev: "Lotus Forge",
    price: 0,
    rating: 0,
    reviews: 0,
    color: "#1A2440",
    accent: "#FFA94D",
    coverUrl: null,
    screenshots: [],
    videoUrl: null,
    status: "REJECTED",
    sizeMB: 248,
    releaseDate: "—",
    submittedAt: "1 พ.ย. 2569",
    unitsSold: 0,
    description: "เดโมสั้น ๆ ของฉากหอระฆัง",
    rejectNote: "ไฟล์เกิน 200 MB",
  },
];

/* ---------- คำสั่งซื้อ ---------- */

export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "REFUNDED" | "CANCELLED";

export interface OrderRow {
  id: string;
  date: string;
  /** ชื่อผู้ซื้อ (ตรงกับ PlatformUser.name) */
  buyer: string;
  /** ชื่อเกมในคำสั่งซื้อ คั่นด้วยจุลภาค */
  items: string;
  gameIds: string[];
  total: number;
  status: OrderStatus;
  /** อ้างอิงการชำระเงินจากระบบจำลอง */
  ref: string;
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  PENDING: { label: "PENDING · รอชำระเงิน", tone: "pill--warn" },
  PAID: { label: "PAID · รอส่งมอบสิทธิ์", tone: "pill--info" },
  FULFILLED: { label: "FULFILLED · ส่งมอบสิทธิ์แล้ว", tone: "pill--ok" },
  REFUNDED: { label: "REFUNDED · คืนเงินแล้ว", tone: "pill--danger" },
  CANCELLED: { label: "CANCELLED · ยกเลิกแล้ว", tone: "pill--danger" },
};

/* ---------- รายละเอียดเกม ---------- */

export const SCREENSHOTS = [
  { bg: "#1A2440", accent: "#FFA94D", caption: "ภาพหน้าจอ: เมืองริมน้ำยามเย็น", sunX: 560 },
  { bg: "#13261F", accent: "#F5C04A", caption: "ภาพหน้าจอ: ป่าโบราณ", sunX: 220 },
  { bg: "#2A1240", accent: "#FF5FA2", caption: "ภาพหน้าจอ: ฉากต่อสู้", sunX: 400 },
  { bg: "#0F2236", accent: "#6EA8FF", caption: "ภาพหน้าจอ: วัดร้างใต้น้ำ", sunX: 640 },
  { bg: "#2E1A14", accent: "#FF7A45", caption: "ภาพหน้าจอ: ตลาดกลางคืน", sunX: 300 },
];

export const RATING_BARS = [
  { label: "5★", pct: "86%" },
  { label: "4★", pct: "10%" },
  { label: "3★", pct: "2%" },
  { label: "2★", pct: "1%" },
  { label: "1★", pct: "1%" },
];

export const SYSTEM_REQS = [
  { label: "ระบบปฏิบัติการ", min: "Windows 10 64-bit", rec: "Windows 11 64-bit" },
  { label: "หน่วยประมวลผล", min: "Intel Core i5-8400 / Ryzen 5 2600", rec: "Intel Core i7-10700 / Ryzen 7 5700X" },
  { label: "หน่วยความจำ", min: "8 GB RAM", rec: "16 GB RAM" },
  { label: "การ์ดจอ", min: "GTX 1060 6 GB", rec: "RTX 3060" },
];

export interface GameReview {
  author: string;
  initial: string;
  avatarColor: string;
  stars: number;
  text: string;
  meta: string;
  devReply?: { studio: string; text: string };
}

/** รีวิวตัวอย่างของเกมที่ขายอยู่แล้ว — เกมที่เพิ่งอนุมัติจะยังไม่มีรีวิว */
export const GAME_REVIEWS: Record<string, GameReview[]> = {
  "echo-of-siam": [
    {
      author: "กัญญาภัทร ส.",
      initial: "ก",
      avatarColor: "#4A3B6B",
      stars: 5,
      text: "เนื้อเรื่องดีมาก ภาษาไทยลื่นไหล ระบบต่อสู้จับจังหวะสนุกกว่าที่คิด เล่นจบไปแล้ว 2 รอบ",
      meta: "เล่นไปแล้ว 32 ชั่วโมง · 3 วันที่แล้ว",
      devReply: { studio: "Lotus Forge", text: "ขอบคุณมากครับ! อัปเดตถัดไปจะเพิ่มภารกิจเสริมในเมืองริมน้ำ" },
    },
    {
      author: "tonkla_99",
      initial: "T",
      avatarColor: "#2E5B4F",
      stars: 4,
      text: "ภาพสวย เพลงดี แต่ช่วงกลางเกมต้องเก็บเลเวลนานไปหน่อย โดยรวมคุ้มราคา",
      meta: "เล่นไปแล้ว 14 ชั่วโมง · 1 สัปดาห์ที่แล้ว",
    },
  ],
  "neon-drift": [
    {
      author: "beam.k",
      initial: "B",
      avatarColor: "#3B4A6B",
      stars: 4,
      text: "ขับสนุก เพลงมันส์ แต่อยากให้มีสนามเพิ่มอีก",
      meta: "เล่นไปแล้ว 21 ชั่วโมง · 5 วันที่แล้ว",
    },
  ],
};

/* ---------- รีวิวที่ผู้พัฒนายังไม่ได้ตอบ ---------- */

export const PENDING_DEV_REVIEWS = [
  { who: "tonkla_99 · Echo of Siam", stars: 4, text: "ช่วงกลางเกมต้องเก็บเลเวลนานไปหน่อย" },
  { who: "mint.pp · Lotus Knight", stars: 3, text: "บอสด่าน 3 ยากเกินไป อยากให้มีระดับความยากให้เลือก" },
  { who: "ploy_s · Echo of Siam", stars: 5, text: "ชอบเพลงประกอบมาก จะมี soundtrack ขายไหม" },
];

/* ---------- ผู้ดูแลระบบ ---------- */

export interface DevRequest {
  id: string;
  name: string;
  email: string;
  initial: string;
  sent: string;
  note: string;
}

export const DEV_REQUESTS: DevRequest[] = [
  { id: "dr1", name: "Kinnaree Works", email: "hello@kinnaree.example", initial: "K", sent: "9 พ.ย. 2569", note: "สตูดิโอ 3 คน ทำเกมปริศนาแนววรรณคดีไทย" },
  { id: "dr2", name: "Mango Byte", email: "team@mangobyte.example", initial: "M", sent: "8 พ.ย. 2569", note: "นักพัฒนาอิสระ เกมแคชวลบนมือถือและพีซี" },
];

/** คำสั่งซื้อเดิมของผู้ใช้อื่นบนแพลตฟอร์ม */
export const SEED_ORDERS: OrderRow[] = [
  { id: "#ORD-24116", date: "13 พ.ย. 2569", buyer: "mint.pp", items: "Lotus Knight", gameIds: ["g9"], total: 299, status: "PAID", ref: "pay_mock_77c1…" },
  { id: "#ORD-24115", date: "13 พ.ย. 2569", buyer: "ploy_s", items: "Pixel Krathong, Star Courier", gameIds: ["g11", "g5"], total: 388, status: "PENDING", ref: "รอ webhook" },
  { id: "#ORD-24109", date: "10 พ.ย. 2569", buyer: "tonkla_99", items: "Iron Monsoon", gameIds: ["g7"], total: 399, status: "REFUNDED", ref: "pay_mock_19de…" },
  { id: "#ORD-24102", date: "6 พ.ย. 2569", buyer: "beam.k", items: "Night Shift BKK", gameIds: ["g10"], total: 229, status: "CANCELLED", ref: "—" },
];

/* ---------- โปรไฟล์ ---------- */

export const PROFILE = {
  name: "ณัฐชนน นกแก้ว",
  handle: "@natchanon",
  email: "natchanon@example.com",
  initial: "ณ",
  bio: "สายเนื้อเรื่องและเกมอินดี้ไทย ชอบไล่เก็บตอนจบลับ ว่าง ๆ ชวนเล่น Neon Drift ได้",
  tags: ["RPG", "ผจญภัย", "แข่งรถ"],
  memberSince: "สมาชิกตั้งแต่ ส.ค. 2569",
};

/* ---------- บัญชีผู้ใช้บนแพลตฟอร์ม (ผู้ดูแลระบบจัดการได้) ---------- */

export type Role = "PLAYER" | "DEVELOPER" | "ADMIN";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  status: "ACTIVE" | "SUSPENDED";
}

export const SEED_USERS: PlatformUser[] = [
  { id: "u-me", name: "ณัฐชนน นกแก้ว", email: "natchanon@example.com", role: "PLAYER", joined: "ส.ค. 2569", status: "ACTIVE" },
  { id: "u2", name: "mint.pp", email: "mint@example.com", role: "PLAYER", joined: "ก.ย. 2569", status: "ACTIVE" },
  { id: "u3", name: "ploy_s", email: "ploy@example.com", role: "PLAYER", joined: "ก.ย. 2569", status: "ACTIVE" },
  { id: "u4", name: "tonkla_99", email: "tonkla@example.com", role: "PLAYER", joined: "ต.ค. 2569", status: "ACTIVE" },
  { id: "u5", name: "beam.k", email: "beam@example.com", role: "PLAYER", joined: "ต.ค. 2569", status: "ACTIVE" },
  { id: "d1", name: "Lotus Forge", email: "dev@lotusforge.example", role: "DEVELOPER", joined: "มิ.ย. 2569", status: "ACTIVE" },
  { id: "d2", name: "Volt Pixel", email: "dev@voltpixel.example", role: "DEVELOPER", joined: "มิ.ย. 2569", status: "ACTIVE" },
  { id: "d3", name: "Moth & Ember", email: "dev@mothember.example", role: "DEVELOPER", joined: "พ.ค. 2569", status: "ACTIVE" },
  { id: "d4", name: "Rice Bowl Games", email: "dev@ricebowl.example", role: "DEVELOPER", joined: "พ.ค. 2569", status: "ACTIVE" },
  { id: "d5", name: "Orbit Nine", email: "dev@orbitnine.example", role: "DEVELOPER", joined: "เม.ย. 2569", status: "ACTIVE" },
  { id: "d6", name: "River Lab", email: "dev@riverlab.example", role: "DEVELOPER", joined: "ม.ค. 2569", status: "ACTIVE" },
  { id: "d7", name: "Storm Anvil", email: "dev@stormanvil.example", role: "DEVELOPER", joined: "ส.ค. 2569", status: "ACTIVE" },
  { id: "d8", name: "Sprout Studio", email: "dev@sprout.example", role: "DEVELOPER", joined: "มี.ค. 2569", status: "ACTIVE" },
  { id: "d9", name: "Tuk Tuk Interactive", email: "dev@tuktuk.example", role: "DEVELOPER", joined: "ม.ค. 2569", status: "ACTIVE" },
  { id: "a1", name: "admin.haftstar", email: "admin@haftstar.example", role: "ADMIN", joined: "ม.ค. 2569", status: "ACTIVE" },
];

export const ACTIVITY = [
  { text: "โพสต์ “วิธีปลดล็อกตอนจบที่ 3” ในคอมมูนิตี้", time: "2 ชั่วโมงที่แล้ว", color: "#C8F04A" },
  { text: "เริ่มติดตาม tonkla_99", time: "1 สัปดาห์ที่แล้ว", color: "#FF8FB0" },
];

export const MY_REVIEWS = [
  { game: "Hollow Lantern", stars: "★★★★★", text: "บรรยากาศดีมาก ปริศนาไม่ยากเกินไป เหมาะกับคนชอบเกมเล่าเรื่อง", time: "3 วันที่แล้ว", helpful: 18 },
  { game: "Neon Drift", stars: "★★★★☆", text: "ขับสนุก เพลงมันส์ แต่อยากให้มีสนามเพิ่มอีก", time: "1 สัปดาห์ที่แล้ว", helpful: 7 },
];

export const MY_POSTS = [
  { cat: "ทริค & แนะนำ", game: "Echo of Siam", time: "2 ชม.ที่แล้ว", title: "วิธีปลดล็อกตอนจบที่ 3 แบบไม่ต้องเล่นใหม่", likes: 128, comments: 2 },
  { cat: "หาเพื่อนเล่น", game: "Neon Drift", time: "4 วันที่แล้ว", title: "ใครว่างลง Time Trial สุดสัปดาห์นี้บ้าง", likes: 15, comments: 6 },
  { cat: "พูดคุยทั่วไป", game: "ทั่วไป", time: "2 สัปดาห์ที่แล้ว", title: "แชร์เกมอินดี้ไทยที่ชอบที่สุดของแต่ละคน", likes: 52, comments: 21 },
];

/* ---------- คอมมูนิตี้ ---------- */

export const POST_CATEGORIES = [
  "ทั้งหมด",
  "พูดคุยทั่วไป",
  "ถาม-ตอบ",
  "หาเพื่อนเล่น",
  "ทริค & แนะนำ",
  "แชร์ภาพหน้าจอ",
] as const;

export interface PostComment {
  author: string;
  initial: string;
  text: string;
}

export interface Post {
  id: string;
  author: string;
  initial: string;
  color: string;
  game: string;
  cat: string;
  title: string;
  body: string;
  likes: number;
  time: string;
  spoiler: boolean;
  comments: PostComment[];
}

export const POSTS: Post[] = [
  {
    id: "p1",
    author: "กัญญาภัทร ส.",
    initial: "ก",
    color: "#4A3B6B",
    game: "Echo of Siam",
    cat: "ทริค & แนะนำ",
    title: "วิธีปลดล็อกตอนจบที่ 3 แบบไม่ต้องเล่นใหม่",
    body: "เก็บเศษระฆังชิ้นที่ 6 ก่อนเข้าวัดใต้น้ำ แล้วคุยกับคนพายเรือ 2 ครั้ง\nจะมีตัวเลือกพิเศษโผล่มาตอนท้ายเกม",
    likes: 128,
    time: "2 ชม.ที่แล้ว",
    spoiler: true,
    comments: [
      { author: "tonkla_99", initial: "T", text: "ขอบคุณมาก หาอยู่ตั้งนาน!" },
      { author: "ploy_s", initial: "P", text: "ชิ้นที่ 6 อยู่ตรงไหนเหรอคะ" },
    ],
  },
  {
    id: "p2",
    author: "tonkla_99",
    initial: "T",
    color: "#2E5B4F",
    game: "Neon Drift",
    cat: "หาเพื่อนเล่น",
    title: "หาทีม Time Trial คืนนี้ 3 ทุ่ม",
    body: "ขาดอีก 2 คน เน้นเล่นสนุก ไม่ซีเรียส ทักมาได้เลย",
    likes: 24,
    time: "5 ชม.ที่แล้ว",
    spoiler: false,
    comments: [{ author: "beam.k", initial: "B", text: "ขอจอยด้วยคนครับ" }],
  },
  {
    id: "p3",
    author: "ploy_s",
    initial: "P",
    color: "#5B3A2E",
    game: "Mekong Mysteries",
    cat: "ถาม-ตอบ",
    title: "ปริศนาด่านประตูน้ำ แก้ยังไงดี",
    body: "ลองหมุนวงล้อทุกแบบแล้วแต่ประตูไม่เปิด มีใครผ่านแล้วบ้าง ขอคำใบ้หน่อย ไม่เอาเฉลยตรง ๆ นะ",
    likes: 9,
    time: "เมื่อวาน",
    spoiler: false,
    comments: [],
  },
  {
    id: "p4",
    author: "mint.pp",
    initial: "M",
    color: "#3B4A6B",
    game: "ทั่วไป",
    cat: "พูดคุยทั่วไป",
    title: "เกมอินดี้ไทยเกมไหนที่ทุกคนแนะนำบ้าง",
    body: "เพิ่งเริ่มเล่นเกมอินดี้ อยากรู้ว่ามีเกมไหนเนื้อเรื่องดี ๆ บ้าง",
    likes: 46,
    time: "2 วันที่แล้ว",
    spoiler: false,
    comments: [],
  },
];

export const MY_GROUPS = [
  { name: "Echo of Siam", members: "สมาชิก 2,140", color: "#1A2440" },
  { name: "Neon Drift", members: "สมาชิก 1,385", color: "#2A1240" },
];

export const TRENDING = [
  { tag: "#EchoOfSiamตอนจบลับ", count: "312 โพสต์" },
  { tag: "#NeonDriftTimeTrial", count: "188 โพสต์" },
  { tag: "#เกมอินดี้ไทย", count: "154 โพสต์" },
  { tag: "#หาทีมคืนนี้", count: "97 โพสต์" },
];

export const ONLINE_FRIENDS = [
  { name: "กัญญาภัทร ส.", initial: "ก", color: "#4A3B6B", status: "กำลังเล่น Echo of Siam" },
  { name: "tonkla_99", initial: "T", color: "#2E5B4F", status: "กำลังเล่น Neon Drift" },
  { name: "ploy_s", initial: "P", color: "#5B3A2E", status: "ออนไลน์" },
];

export const COMMUNITY_RULES = [
  "สุภาพ ไม่ใช้คำหยาบหรือโจมตีผู้อื่น",
  "ติดป้าย “มีสปอยล์” เมื่อเล่าเนื้อเรื่อง",
  "ห้ามซื้อขายบัญชีหรือ License Key",
  "ห้ามโพสต์ลิงก์เกมเถื่อน",
];
