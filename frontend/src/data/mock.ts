/**
 * ข้อมูลตัวอย่างสำหรับหน้า UI
 * ใช้ชั่วคราวระหว่างยังไม่ได้ต่อ API จริง — เมื่อต่อ backend แล้วให้เปลี่ยนไปเรียกผ่าน lib/api.ts
 */

export interface Game {
  id: string;
  slug: string;
  title: string;
  genre: string;
  dev: string;
  price: number;
  rating: number;
  reviews: number;
  color: string;
  accent: string;
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

export const GAMES: Game[] = [
  { id: "g1", slug: "echo-of-siam", title: "Echo of Siam", genre: "RPG", dev: "Lotus Forge", price: 459, rating: 4.9, reviews: 1284, color: "#1A2440", accent: "#FFA94D" },
  { id: "g2", slug: "neon-drift", title: "Neon Drift", genre: "แข่งรถ", dev: "Volt Pixel", price: 349, rating: 4.6, reviews: 642, color: "#2A1240", accent: "#FF5FA2" },
  { id: "g3", slug: "hollow-lantern", title: "Hollow Lantern", genre: "ผจญภัย", dev: "Moth & Ember", price: 259, rating: 4.8, reviews: 918, color: "#13261F", accent: "#F5C04A" },
  { id: "g4", slug: "paddy-tactics", title: "Paddy Tactics", genre: "กลยุทธ์", dev: "Rice Bowl Games", price: 199, rating: 4.3, reviews: 221, color: "#253014", accent: "#C8F04A" },
  { id: "g5", slug: "star-courier", title: "Star Courier", genre: "จำลอง", dev: "Orbit Nine", price: 289, rating: 4.5, reviews: 376, color: "#0F2236", accent: "#6EA8FF" },
  { id: "g6", slug: "mekong-mysteries", title: "Mekong Mysteries", genre: "ปริศนา", dev: "River Lab", price: 149, rating: 4.7, reviews: 512, color: "#14302F", accent: "#5BD4C4" },
  { id: "g7", slug: "iron-monsoon", title: "Iron Monsoon", genre: "แอ็กชัน", dev: "Storm Anvil", price: 399, rating: 4.2, reviews: 189, color: "#2E1A14", accent: "#FF7A45" },
  { id: "g8", slug: "tiny-garden-co-op", title: "Tiny Garden Co-op", genre: "แคชวล", dev: "Sprout Studio", price: 119, rating: 4.4, reviews: 430, color: "#2B2414", accent: "#9BE15D" },
  { id: "g9", slug: "lotus-knight", title: "Lotus Knight", genre: "แอ็กชัน", dev: "Lotus Forge", price: 299, rating: 4.1, reviews: 167, color: "#301528", accent: "#FF8FC7" },
  { id: "g10", slug: "night-shift-bkk", title: "Night Shift BKK", genre: "จำลอง", dev: "Tuk Tuk Interactive", price: 229, rating: 4.6, reviews: 288, color: "#161A3A", accent: "#B18CFF" },
  { id: "g11", slug: "pixel-krathong", title: "Pixel Krathong", genre: "แคชวล", dev: "Sprout Studio", price: 99, rating: 4.3, reviews: 354, color: "#122838", accent: "#FFD166" },
  { id: "g12", slug: "deep-reef-signal", title: "Deep Reef Signal", genre: "ผจญภัย", dev: "Orbit Nine", price: 319, rating: 4.5, reviews: 203, color: "#0C2A33", accent: "#4FD1E8" },
];

export const FEATURED = GAMES[0];

/* ---------- คลังเกม ---------- */

export interface OwnedGame {
  slug: string;
  title: string;
  dev: string;
  color: string;
  accent: string;
  size: string;
  licenseKey: string;
  date: string;
  order: string;
  price: string;
  status: string;
}

export const OWNED: OwnedGame[] = [
  { slug: "echo-of-siam", title: "Echo of Siam", dev: "Lotus Forge", color: "#1A2440", accent: "#FFA94D", size: "148 MB", licenseKey: "HSG-7K4Q-M2RD-9WZT", date: "10 พ.ย. 2569", order: "#ORD-24117", price: "฿459", status: "ใหม่ · ยังไม่ดาวน์โหลด" },
  { slug: "neon-drift", title: "Neon Drift", dev: "Volt Pixel", color: "#2A1240", accent: "#FF5FA2", size: "186 MB", licenseKey: "HSG-3HCV-8PLE-Q61N", date: "2 พ.ย. 2569", order: "#ORD-23980", price: "฿349", status: "ดาวน์โหลดแล้ว" },
  { slug: "mekong-mysteries", title: "Mekong Mysteries", dev: "River Lab", color: "#14302F", accent: "#5BD4C4", size: "64 MB", licenseKey: "HSG-B9TA-2XKM-77FD", date: "2 พ.ย. 2569", order: "#ORD-23980", price: "฿149", status: "ดาวน์โหลดแล้ว" },
  { slug: "hollow-lantern", title: "Hollow Lantern", dev: "Moth & Ember", color: "#13261F", accent: "#F5C04A", size: "121 MB", licenseKey: "HSG-L0WE-5NRQ-H8JS", date: "3 ต.ค. 2569", order: "#ORD-23102", price: "฿259", status: "ดาวน์โหลดแล้ว" },
  { slug: "star-courier", title: "Star Courier", dev: "Orbit Nine", color: "#0F2236", accent: "#6EA8FF", size: "97 MB", licenseKey: "HSG-S7AR-C0UR-1E2Y", date: "3 ต.ค. 2569", order: "#ORD-23102", price: "฿289", status: "ดาวน์โหลดแล้ว" },
];

export interface OrderRow {
  id: string;
  date: string;
  items: string;
  total: string;
  status: "FULFILLED" | "REFUNDED" | "PENDING";
}

export const ORDERS: OrderRow[] = [
  { id: "#ORD-24117", date: "10 พ.ย. 2569", items: "Echo of Siam", total: "฿459", status: "FULFILLED" },
  { id: "#ORD-23980", date: "2 พ.ย. 2569", items: "Neon Drift, Mekong Mysteries", total: "฿498", status: "FULFILLED" },
  { id: "#ORD-23511", date: "18 ต.ค. 2569", items: "Iron Monsoon", total: "฿399", status: "REFUNDED" },
  { id: "#ORD-23102", date: "3 ต.ค. 2569", items: "Hollow Lantern, Star Courier", total: "฿548", status: "FULFILLED" },
];

export const ORDER_STATUS: Record<OrderRow["status"], { label: string; tone: string }> = {
  FULFILLED: { label: "FULFILLED · ส่งมอบสิทธิ์แล้ว", tone: "pill--ok" },
  REFUNDED: { label: "REFUNDED · คืนเงินแล้ว", tone: "pill--danger" },
  PENDING: { label: "PENDING · รอชำระเงิน", tone: "pill--warn" },
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
  { label: "พื้นที่จัดเก็บ", min: "ไฟล์ติดตั้ง 148 MB", rec: "ไฟล์ติดตั้ง 148 MB (SSD)" },
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

export const GAME_REVIEWS: GameReview[] = [
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
];

/* ---------- โปรไฟล์ ---------- */

export const PROFILE = {
  name: "ณัฐชนน นกแก้ว",
  handle: "@natchanon",
  initial: "ณ",
  bio: "สายเนื้อเรื่องและเกมอินดี้ไทย ชอบไล่เก็บตอนจบลับ ว่าง ๆ ชวนเล่น Neon Drift ได้",
  tags: ["RPG", "ผจญภัย", "แข่งรถ"],
  memberSince: "สมาชิกตั้งแต่ ส.ค. 2569",
  stats: [
    { label: "เกมในคลัง", value: "5" },
    { label: "รีวิว", value: "12" },
    { label: "โพสต์คอมมูนิตี้", value: "34" },
    { label: "ผู้ติดตาม", value: "128" },
    { label: "กำลังติดตาม", value: "57" },
  ],
};

export const RECENT_GAMES = [
  { title: "Echo of Siam", color: "#1A2440", accent: "#FFA94D", hours: 32, progress: "78%" },
  { title: "Neon Drift", color: "#2A1240", accent: "#FF5FA2", hours: 21, progress: "54%" },
  { title: "Mekong Mysteries", color: "#14302F", accent: "#5BD4C4", hours: 9, progress: "40%" },
  { title: "Hollow Lantern", color: "#13261F", accent: "#F5C04A", hours: 14, progress: "100%" },
  { title: "Star Courier", color: "#0F2236", accent: "#6EA8FF", hours: 6, progress: "22%" },
];

export const ACTIVITY = [
  { text: "โพสต์ “วิธีปลดล็อกตอนจบที่ 3” ในคอมมูนิตี้", time: "2 ชั่วโมงที่แล้ว", color: "#C8F04A" },
  { text: "ซื้อเกม Echo of Siam", time: "วันนี้", color: "#6EA8FF" },
  { text: "รีวิว Hollow Lantern ★★★★★", time: "3 วันที่แล้ว", color: "#F5C04A" },
  { text: "เริ่มติดตาม tonkla_99", time: "1 สัปดาห์ที่แล้ว", color: "#FF8FB0" },
];

export const MY_REVIEWS = [
  { game: "Hollow Lantern", stars: "★★★★★", text: "บรรยากาศดีมาก ปริศนาไม่ยากเกินไป เหมาะกับคนชอบเกมเล่าเรื่อง", time: "3 วันที่แล้ว", helpful: 18 },
  { game: "Neon Drift", stars: "★★★★☆", text: "ขับสนุก เพลงมันส์ แต่อยากให้มีสนามเพิ่มอีก", time: "1 สัปดาห์ที่แล้ว", helpful: 7 },
  { game: "Star Courier", stars: "★★★☆☆", text: "ไอเดียดีแต่ช่วงต้นเกมช้าไปนิด", time: "2 สัปดาห์ที่แล้ว", helpful: 3 },
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

export const MY_POSTS = [
  { cat: "ทริค & แนะนำ", game: "Echo of Siam", time: "2 ชม.ที่แล้ว", title: "วิธีปลดล็อกตอนจบที่ 3 แบบไม่ต้องเล่นใหม่", likes: 128, comments: 2 },
  { cat: "หาเพื่อนเล่น", game: "Neon Drift", time: "4 วันที่แล้ว", title: "ใครว่างลง Time Trial สุดสัปดาห์นี้บ้าง", likes: 15, comments: 6 },
  { cat: "พูดคุยทั่วไป", game: "ทั่วไป", time: "2 สัปดาห์ที่แล้ว", title: "แชร์เกมอินดี้ไทยที่ชอบที่สุดของแต่ละคน", likes: 52, comments: 21 },
];
