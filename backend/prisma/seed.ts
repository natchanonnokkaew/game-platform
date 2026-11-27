import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { PrismaClient, type ApprovalStatus, type OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ข้อมูลตั้งต้นสำหรับทดสอบและสาธิตงาน 30% — รันด้วย: npm run seed
 * รันซ้ำได้ (ไม่สร้างข้อมูลซ้ำ) · บัญชีทั้งหมดใช้รหัสผ่าน: password123
 *
 * บัญชีหลักสำหรับสาธิต
 *   admin@example.com   ผู้ดูแลระบบ
 *   dev@example.com     ผู้พัฒนา Lotus Forge (อนุมัติแล้ว · มีเกมขายอยู่ รอตรวจ และถูกปฏิเสธ)
 *   player@example.com  ผู้เล่น (มีเกมในคลัง 2 เกม และมีเกมในตะกร้า 1 เกม)
 *   kinnaree@example.com ผู้พัฒนาที่ยังรออนุมัติบัญชี
 */

const PASSWORD = "password123";
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

/* ---------- หมวดหมู่ (ชื่อตรงกับชิปในหน้าร้านค้า) ---------- */
const CATEGORIES = [
  { slug: "action", name: "แอ็กชัน" },
  { slug: "adventure", name: "ผจญภัย" },
  { slug: "rpg", name: "RPG" },
  { slug: "strategy", name: "กลยุทธ์" },
  { slug: "simulation", name: "จำลอง" },
  { slug: "puzzle", name: "ปริศนา" },
  { slug: "racing", name: "แข่งรถ" },
  { slug: "casual", name: "แคชวล" },
];

/* ---------- ผู้ใช้ ---------- */
const PLAYERS = [
  { email: "player@example.com", name: "ผู้เล่นทดสอบ" },
  { email: "mint@example.com", name: "mint.pp" },
  { email: "ploy@example.com", name: "ploy_s" },
  { email: "tonkla@example.com", name: "tonkla_99" },
  { email: "beam@example.com", name: "beam.k" },
];

const DEVELOPERS: { email: string; studio: string; status: ApprovalStatus; description?: string }[] = [
  { email: "dev@example.com", studio: "Lotus Forge", status: "APPROVED", description: "สตูดิโออินดี้ไทย ทำเกม RPG และแอ็กชัน" },
  { email: "voltpixel@example.com", studio: "Volt Pixel", status: "APPROVED" },
  { email: "mothember@example.com", studio: "Moth & Ember", status: "APPROVED" },
  { email: "ricebowl@example.com", studio: "Rice Bowl Games", status: "APPROVED" },
  { email: "orbitnine@example.com", studio: "Orbit Nine", status: "APPROVED" },
  { email: "riverlab@example.com", studio: "River Lab", status: "APPROVED" },
  { email: "stormanvil@example.com", studio: "Storm Anvil", status: "APPROVED" },
  { email: "sprout@example.com", studio: "Sprout Studio", status: "APPROVED" },
  { email: "tuktuk@example.com", studio: "Tuk Tuk Interactive", status: "APPROVED" },
  // ยังรอผู้ดูแลระบบอนุมัติบัญชี — ใช้สาธิต FR-16
  { email: "kinnaree@example.com", studio: "Kinnaree Works", status: "PENDING", description: "สตูดิโอ 3 คน ทำเกมปริศนาแนววรรณคดีไทย" },
  { email: "mangobyte@example.com", studio: "Mango Byte", status: "PENDING", description: "นักพัฒนาอิสระ เกมแคชวลบนพีซี" },
];

/* ---------- เกม: อนุมัติแล้ว 12 · รอตรวจสอบ 4 · ถูกปฏิเสธ 1 ---------- */
type SeedGame = {
  slug: string;
  title: string;
  category: string;
  studio: string;
  price: number;
  sizeMB: number;
  description: string;
  status: ApprovalStatus;
  publishedAt?: string;
  rejectNote?: string;
};

const GAMES: SeedGame[] = [
  { slug: "echo-of-siam", title: "Echo of Siam", category: "rpg", studio: "Lotus Forge", price: 459, sizeMB: 148, status: "APPROVED", publishedAt: "2026-08-12", description: "RPG ผจญภัยในอาณาจักรโบราณ สำรวจเมืองริมน้ำ ไขปริศนาวัดร้าง และสร้างทีมของคุณเอง" },
  { slug: "neon-drift", title: "Neon Drift", category: "racing", studio: "Volt Pixel", price: 349, sizeMB: 186, status: "APPROVED", publishedAt: "2026-07-03", description: "เกมแข่งรถกลางเมืองนีออน เน้นการดริฟต์และทำเวลาให้ดีที่สุด" },
  { slug: "hollow-lantern", title: "Hollow Lantern", category: "adventure", studio: "Moth & Ember", price: 259, sizeMB: 121, status: "APPROVED", publishedAt: "2026-05-20", description: "เกมผจญภัยบรรยากาศมืดสลัว ไขปริศนาในป่าโบราณด้วยแสงจากโคมเพียงดวงเดียว" },
  { slug: "paddy-tactics", title: "Paddy Tactics", category: "strategy", studio: "Rice Bowl Games", price: 199, sizeMB: 92, status: "APPROVED", publishedAt: "2026-06-08", description: "เกมวางแผนผลัดตาบนทุ่งนา จัดทัพและใช้ภูมิประเทศให้เป็นประโยชน์" },
  { slug: "star-courier", title: "Star Courier", category: "simulation", studio: "Orbit Nine", price: 289, sizeMB: 97, status: "APPROVED", publishedAt: "2026-04-15", description: "จำลองการเป็นคนส่งของระหว่างดาว บริหารเชื้อเพลิงและเวลาให้ทัน" },
  { slug: "mekong-mysteries", title: "Mekong Mysteries", category: "puzzle", studio: "River Lab", price: 149, sizeMB: 64, status: "APPROVED", publishedAt: "2026-02-02", description: "เกมปริศนาเล่าเรื่องริมแม่น้ำโขง ไขคดีจากหลักฐานที่ชาวบ้านทิ้งไว้" },
  { slug: "iron-monsoon", title: "Iron Monsoon", category: "action", studio: "Storm Anvil", price: 399, sizeMB: 203, status: "APPROVED", publishedAt: "2026-09-28", description: "เกมแอ็กชันต่อสู้กลางพายุฝน ใช้อาวุธหนักฝ่าแนวข้าศึก" },
  { slug: "tiny-garden-co-op", title: "Tiny Garden Co-op", category: "casual", studio: "Sprout Studio", price: 119, sizeMB: 58, status: "APPROVED", publishedAt: "2026-03-11", description: "เกมปลูกสวนเล่นด้วยกันได้สองคน เน้นผ่อนคลายไม่มีเวลาจำกัด" },
  { slug: "lotus-knight", title: "Lotus Knight", category: "action", studio: "Lotus Forge", price: 299, sizeMB: 134, status: "APPROVED", publishedAt: "2026-10-30", description: "เกมแอ็กชันผจญภัย รับบทอัศวินดอกบัวผู้ปกป้องวิหารกลางบึง" },
  { slug: "night-shift-bkk", title: "Night Shift BKK", category: "simulation", studio: "Tuk Tuk Interactive", price: 229, sizeMB: 112, status: "APPROVED", publishedAt: "2026-01-19", description: "จำลองชีวิตคนขับรถกลางคืนในกรุงเทพ พบผู้โดยสารและเรื่องเล่าต่าง ๆ" },
  { slug: "pixel-krathong", title: "Pixel Krathong", category: "casual", studio: "Sprout Studio", price: 99, sizeMB: 42, status: "APPROVED", publishedAt: "2026-11-05", description: "เกมแคชวลลอยกระทงสไตล์พิกเซล ประดิษฐ์กระทงและลอยไปตามสายน้ำ" },
  { slug: "deep-reef-signal", title: "Deep Reef Signal", category: "adventure", studio: "Orbit Nine", price: 319, sizeMB: 176, status: "APPROVED", publishedAt: "2026-08-24", description: "สำรวจแนวปะการังลึก ตามหาสัญญาณปริศนาที่ส่งมาจากใต้ทะเล" },
  // คิวรอผู้ดูแลระบบตรวจสอบ — ใช้สาธิต FR-15
  { slug: "temple-runner-dx", title: "Temple Runner DX", category: "action", studio: "Lotus Forge", price: 179, sizeMB: 172, status: "PENDING", description: "เกมวิ่งหลบสิ่งกีดขวางในโบราณสถาน เก็บเหรียญและทำคะแนนให้ไกลที่สุด" },
  { slug: "rain-garden", title: "Rain Garden", category: "casual", studio: "Sprout Studio", price: 89, sizeMB: 88, status: "PENDING", description: "เกมจัดสวนในวันฝนตก ฟังเสียงฝนและปลูกต้นไม้ไปเรื่อย ๆ" },
  { slug: "cyber-songkran", title: "Cyber Songkran", category: "racing", studio: "Volt Pixel", price: 259, sizeMB: 194, status: "PENDING", description: "แข่งรถสาดน้ำกลางเทศกาลสงกรานต์ในเมืองอนาคต" },
  { slug: "quiet-lighthouse", title: "Quiet Lighthouse", category: "puzzle", studio: "River Lab", price: 129, sizeMB: 45, status: "PENDING", description: "เกมปริศนาในประภาคารร้าง ไขรหัสจากบันทึกของผู้ดูแลคนก่อน" },
  // ถูกปฏิเสธพร้อมเหตุผล — ผู้พัฒนาแก้ไขแล้วส่งใหม่ได้
  { slug: "bell-tower-demo", title: "Bell Tower Demo", category: "adventure", studio: "Lotus Forge", price: 0, sizeMB: 0, status: "REJECTED", rejectNote: "ยังไม่มีไฟล์เกม และคำอธิบายสั้นเกินไป", description: "เดโมสั้น ๆ ของฉากหอระฆัง" },
];

/* ---------- คำสั่งซื้อตัวอย่าง (ครบทุกสถานะ PAID / FAILED / REFUNDED) ---------- */
const ORDERS: { buyer: string; games: string[]; status: OrderStatus; method: "MOCK_CARD" | "MOCK_QR"; at: string }[] = [
  { buyer: "player@example.com", games: ["echo-of-siam", "mekong-mysteries"], status: "PAID", method: "MOCK_CARD", at: "2026-11-02T10:15:00+07:00" },
  { buyer: "mint@example.com", games: ["lotus-knight"], status: "PAID", method: "MOCK_QR", at: "2026-11-13T20:40:00+07:00" },
  { buyer: "ploy@example.com", games: ["pixel-krathong", "star-courier"], status: "PAID", method: "MOCK_CARD", at: "2026-11-13T09:05:00+07:00" },
  { buyer: "ploy@example.com", games: ["echo-of-siam"], status: "PAID", method: "MOCK_QR", at: "2026-11-15T19:30:00+07:00" },
  { buyer: "tonkla@example.com", games: ["echo-of-siam"], status: "PAID", method: "MOCK_CARD", at: "2026-11-08T21:10:00+07:00" },
  { buyer: "tonkla@example.com", games: ["iron-monsoon"], status: "REFUNDED", method: "MOCK_CARD", at: "2026-11-10T14:00:00+07:00" },
  { buyer: "beam@example.com", games: ["neon-drift"], status: "PAID", method: "MOCK_QR", at: "2026-11-04T18:20:00+07:00" },
  { buyer: "beam@example.com", games: ["night-shift-bkk"], status: "FAILED", method: "MOCK_CARD", at: "2026-11-06T11:45:00+07:00" },
];

/* ---------- รีวิว (เฉพาะเกมที่ผู้รีวิวมีในคลัง) ---------- */
const REVIEWS: { user: string; game: string; rating: number; body: string; reply?: string }[] = [
  { user: "player@example.com", game: "echo-of-siam", rating: 5, body: "เนื้อเรื่องดีมาก ภาษาไทยลื่นไหล ระบบต่อสู้จับจังหวะสนุกกว่าที่คิด", reply: "ขอบคุณมากครับ! อัปเดตถัดไปจะเพิ่มภารกิจเสริมในเมืองริมน้ำ" },
  { user: "tonkla@example.com", game: "echo-of-siam", rating: 4, body: "ภาพสวย เพลงดี แต่ช่วงกลางเกมต้องเก็บเลเวลนานไปหน่อย โดยรวมคุ้มราคา" },
  { user: "ploy@example.com", game: "echo-of-siam", rating: 5, body: "ชอบเพลงประกอบมาก จะมี soundtrack ขายไหม" },
  { user: "beam@example.com", game: "neon-drift", rating: 4, body: "ขับสนุก เพลงมันส์ แต่อยากให้มีสนามเพิ่มอีก" },
  { user: "mint@example.com", game: "lotus-knight", rating: 3, body: "บอสด่าน 3 ยากเกินไป อยากให้มีระดับความยากให้เลือก" },
  { user: "ploy@example.com", game: "pixel-krathong", rating: 5, body: "น่ารัก เล่นเพลินมาก เหมาะกับช่วงลอยกระทง" },
];

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const block = () => Array.from({ length: 4 }, () => CHARS[crypto.randomInt(CHARS.length)]).join("");
const licenseKey = () => [block(), block(), block(), block()].join("-");

/** ไฟล์เกมตัวอย่างขนาดเล็ก (ไฟล์ข้อความ) ให้ทดสอบการดาวน์โหลดได้ครบวงจร */
function writeSampleFile(game: SeedGame) {
  const fileKey = `seed-${game.slug}.txt`;
  const content =
    `${game.title}\n` +
    `ไฟล์เกมตัวอย่างสำหรับทดสอบระบบ HAFTSTAR GAME (ข้อมูลจาก seed)\n` +
    `ผู้พัฒนา: ${game.studio}\n`;
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, fileKey), content, "utf8");
  return { fileKey, fileName: `${game.slug}-demo.txt`, fileSize: Buffer.byteLength(content) };
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: { name: c.name } });
  }

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: { email: "admin@example.com", passwordHash, displayName: "ผู้ดูแลระบบ", role: "ADMIN" },
    update: {},
  });

  const userId = new Map<string, string>();
  for (const p of PLAYERS) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      create: { email: p.email, passwordHash, displayName: p.name, role: "PLAYER" },
      update: {},
    });
    userId.set(p.email, u.id);
  }

  const studioId = new Map<string, string>();
  for (const d of DEVELOPERS) {
    const u = await prisma.user.upsert({
      where: { email: d.email },
      create: {
        email: d.email,
        passwordHash,
        displayName: d.studio,
        role: "DEVELOPER",
        developerProfile: { create: { studioName: d.studio, status: d.status, description: d.description } },
      },
      update: {},
      include: { developerProfile: true },
    });
    userId.set(d.email, u.id);
    if (u.developerProfile) studioId.set(d.studio, u.developerProfile.id);
  }

  const gameId = new Map<string, { id: string; price: number }>();
  for (const g of GAMES) {
    const developerId = studioId.get(g.studio);
    if (!developerId) throw new Error(`ไม่พบสตูดิโอ ${g.studio}`);
    const file = g.sizeMB > 0 ? writeSampleFile(g) : {};
    const saved = await prisma.game.upsert({
      where: { slug: g.slug },
      create: {
        slug: g.slug,
        title: g.title,
        description: g.description,
        priceTHB: g.price,
        status: g.status,
        rejectNote: g.rejectNote,
        publishedAt: g.publishedAt ? new Date(g.publishedAt) : null,
        minSpec: "Windows 10 64-bit · CPU Intel Core i5 · RAM 8 GB",
        recSpec: "Windows 11 64-bit · CPU Intel Core i7 · RAM 16 GB",
        developerId,
        categories: { connect: [{ slug: g.category }] },
        ...file,
      },
      update: {},
    });
    gameId.set(g.slug, { id: saved.id, price: g.price });
  }

  // คำสั่งซื้อ: สร้างเฉพาะครั้งแรก (ถ้าผู้ซื้อมีคำสั่งซื้ออยู่แล้วจะข้าม)
  for (const o of ORDERS) {
    const buyer = userId.get(o.buyer)!;
    const items = o.games.map((slug) => gameId.get(slug)!);
    const at = new Date(o.at);
    const exists = await prisma.order.findFirst({ where: { userId: buyer, createdAt: at } });
    if (exists) continue;

    const total = items.reduce((s, g) => s + g.price, 0);
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${at.getTime()}-${crypto.randomInt(1000, 9999)}`,
          userId: buyer,
          totalTHB: total,
          status: o.status,
          paidAt: o.status === "FAILED" ? null : at,
          createdAt: at,
          items: { create: items.map((g) => ({ gameId: g.id, priceTHB: g.price })) },
          payment: {
            create: {
              method: o.method,
              reference: `PAY-${crypto.randomUUID()}`,
              amountTHB: total,
              status: o.status,
              createdAt: at,
            },
          },
        },
        include: { items: true },
      });
      if (o.status === "FAILED") return; // ชำระไม่สำเร็จ: ไม่ออก License Key และไม่เข้าคลัง

      for (const item of order.items) {
        await tx.licenseKey.create({
          data: {
            key: licenseKey(),
            gameId: item.gameId,
            userId: buyer,
            orderItemId: item.id,
            issuedAt: at,
            // คืนเงินแล้ว: เพิกถอนรหัสแทนการลบ และไม่อยู่ในคลังเกม
            revokedAt: o.status === "REFUNDED" ? new Date(at.getTime() + 2 * 86400000) : null,
          },
        });
        if (o.status === "PAID") {
          await tx.libraryItem.create({ data: { userId: buyer, gameId: item.gameId, acquiredAt: at } });
        }
      }
    });
  }

  for (const r of REVIEWS) {
    const uid = userId.get(r.user)!;
    const gid = gameId.get(r.game)!.id;
    const review = await prisma.review.upsert({
      where: { userId_gameId: { userId: uid, gameId: gid } },
      create: { userId: uid, gameId: gid, rating: r.rating, body: r.body },
      update: {},
      include: { replies: true },
    });
    if (r.reply && review.replies.length === 0) {
      await prisma.reviewReply.create({
        data: { reviewId: review.id, authorId: userId.get("dev@example.com")!, body: r.reply },
      });
    }
  }

  // ตะกร้าและรายการที่ต้องการของผู้เล่นหลัก
  const player = userId.get("player@example.com")!;
  await prisma.cartItem.upsert({
    where: { userId_gameId: { userId: player, gameId: gameId.get("neon-drift")!.id } },
    create: { userId: player, gameId: gameId.get("neon-drift")!.id },
    update: {},
  });
  await prisma.wishlistItem.upsert({
    where: { userId_gameId: { userId: player, gameId: gameId.get("hollow-lantern")!.id } },
    create: { userId: player, gameId: gameId.get("hollow-lantern")!.id },
    update: {},
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.order.count(),
    prisma.licenseKey.count(),
    prisma.review.count(),
  ]);
  console.log(
    `เพิ่มข้อมูลตั้งต้นเรียบร้อย — ผู้ใช้ ${counts[0]} · เกม ${counts[1]} · คำสั่งซื้อ ${counts[2]} · License Key ${counts[3]} · รีวิว ${counts[4]}`
  );
  console.log(`รหัสผ่านทุกบัญชี: ${PASSWORD}  (admin@example.com · dev@example.com · player@example.com)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
