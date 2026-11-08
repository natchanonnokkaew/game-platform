import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ข้อมูลตั้งต้นสำหรับทดสอบ — รันด้วย: npm run seed
 * บัญชีทั้งหมดใช้รหัสผ่าน: password123
 */
async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const categories = ["Action", "RPG", "Puzzle", "Simulation", "Indie"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      create: { name, slug: name.toLowerCase() },
      update: {},
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      passwordHash,
      displayName: "ผู้ดูแลระบบ",
      role: "ADMIN",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "player@example.com" },
    create: {
      email: "player@example.com",
      passwordHash,
      displayName: "ผู้เล่นทดสอบ",
      role: "PLAYER",
    },
    update: {},
  });

  const dev = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    create: {
      email: "dev@example.com",
      passwordHash,
      displayName: "นักพัฒนาทดสอบ",
      role: "DEVELOPER",
      developerProfile: {
        create: { studioName: "RSU Indie Studio", status: "APPROVED" },
      },
    },
    update: {},
    include: { developerProfile: true },
  });

  if (dev.developerProfile) {
    await prisma.game.upsert({
      where: { slug: "sample-game" },
      create: {
        title: "Sample Game (ไฟล์ตัวอย่าง)",
        slug: "sample-game",
        description: "เกมตัวอย่างขนาดเล็กสำหรับทดสอบกระบวนการแบบครบวงจร",
        priceTHB: 199,
        status: "APPROVED",
        publishedAt: new Date(),
        minSpec: "Windows 10, RAM 4 GB",
        recSpec: "Windows 11, RAM 8 GB",
        developerId: dev.developerProfile.id,
        categories: { connect: [{ slug: "indie" }] },
      },
      update: {},
    });
  }

  console.log("เพิ่มข้อมูลตั้งต้นเรียบร้อย (รหัสผ่านทุกบัญชี: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
