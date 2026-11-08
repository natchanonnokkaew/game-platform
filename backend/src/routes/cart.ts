import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const cartRouter = Router();

cartRouter.use(requireAuth);

const gameSelect = { id: true, title: true, slug: true, priceTHB: true, coverUrl: true } as const;

/** GET /api/cart */
cartRouter.get("/", async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.auth!.userId },
    include: { game: { select: gameSelect } },
    orderBy: { addedAt: "desc" },
  });
  res.json({
    items,
    totalTHB: items.reduce((sum, item) => sum + Number(item.game.priceTHB), 0),
  });
});

/** POST /api/cart  { gameId } */
cartRouter.post("/", async (req, res) => {
  const { gameId } = req.body ?? {};
  if (!gameId) return res.status(400).json({ error: "ต้องระบุ gameId" });

  const item = await prisma.cartItem.upsert({
    where: { userId_gameId: { userId: req.auth!.userId, gameId } },
    create: { userId: req.auth!.userId, gameId },
    update: {},
    include: { game: { select: gameSelect } },
  });
  res.status(201).json(item);
});

/** DELETE /api/cart/:gameId */
cartRouter.delete("/:gameId", async (req, res) => {
  await prisma.cartItem.deleteMany({
    where: { userId: req.auth!.userId, gameId: req.params.gameId },
  });
  res.status(204).end();
});

// ---------- Wishlist ----------

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth);

wishlistRouter.get("/", async (req, res) => {
  res.json(
    await prisma.wishlistItem.findMany({
      where: { userId: req.auth!.userId },
      include: { game: { select: gameSelect } },
      orderBy: { addedAt: "desc" },
    })
  );
});

wishlistRouter.post("/", async (req, res) => {
  const { gameId } = req.body ?? {};
  if (!gameId) return res.status(400).json({ error: "ต้องระบุ gameId" });
  res.status(201).json(
    await prisma.wishlistItem.upsert({
      where: { userId_gameId: { userId: req.auth!.userId, gameId } },
      create: { userId: req.auth!.userId, gameId },
      update: {},
    })
  );
});

wishlistRouter.delete("/:gameId", async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.auth!.userId, gameId: req.params.gameId },
  });
  res.status(204).end();
});
