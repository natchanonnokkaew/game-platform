import crypto from "node:crypto";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const ordersRouter = Router();

function makeLicenseKey(): string {
  // รูปแบบ XXXX-XXXX-XXXX-XXXX
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join("");
  return [block(), block(), block(), block()].join("-");
}

/**
 * POST /api/orders/checkout
 * สร้างคำสั่งซื้อจากตะกร้า + จำลองการชำระเงิน + ออก License Key + เพิ่มเข้าคลังเกม
 * ทำทั้งหมดใน transaction เดียว เพื่อไม่ให้ข้อมูลค้างกลางทาง
 */
ordersRouter.post("/checkout", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const method: string = req.body?.method ?? "MOCK_CARD";

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { game: true },
  });
  if (cart.length === 0) return res.status(400).json({ error: "ตะกร้าว่าง" });

  const notApproved = cart.find((item) => item.game.status !== "APPROVED");
  if (notApproved) {
    return res.status(400).json({ error: `เกม "${notApproved.game.title}" ยังไม่เปิดจำหน่าย` });
  }

  const owned = await prisma.libraryItem.findFirst({
    where: { userId, gameId: { in: cart.map((c) => c.gameId) } },
    include: { game: true },
  });
  if (owned) {
    return res.status(409).json({ error: `คุณมีเกม "${owned.game.title}" อยู่ในคลังแล้ว` });
  }

  const total = cart.reduce((sum, item) => sum + Number(item.game.priceTHB), 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
        userId,
        totalTHB: total,
        status: "PAID", // จำลองว่าชำระเงินสำเร็จทันที
        paidAt: new Date(),
        items: {
          create: cart.map((item) => ({
            gameId: item.gameId,
            priceTHB: item.game.priceTHB,
          })),
        },
        payment: {
          create: {
            method,
            reference: `PAY-${crypto.randomUUID()}`,
            amountTHB: total,
            status: "PAID",
          },
        },
      },
      include: { items: true },
    });

    // ออก License Key + ใส่เกมเข้าคลังของผู้เล่น
    for (const item of created.items) {
      await tx.licenseKey.create({
        data: {
          key: makeLicenseKey(),
          gameId: item.gameId,
          userId,
          orderItemId: item.id,
        },
      });
      await tx.libraryItem.create({ data: { userId, gameId: item.gameId } });
    }

    await tx.cartItem.deleteMany({ where: { userId } });
    return created;
  });

  const full = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: { include: { game: { select: { title: true } }, licenseKey: true } },
      payment: true,
    },
  });

  res.status(201).json(full);
});

/** GET /api/orders — ประวัติการสั่งซื้อของตัวเอง */
ordersRouter.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.auth!.userId },
    include: {
      items: { include: { game: { select: { title: true, coverUrl: true, slug: true } }, licenseKey: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});
