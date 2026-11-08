import { Router } from "express";
import { prisma } from "../lib/prisma";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth";
import { gameUpload } from "../lib/upload";

export const gamesRouter = Router();

/** GET /api/games — ค้นหา/กรองเกม (guest ดูได้) */
gamesRouter.get("/", optionalAuth, async (req, res) => {
  const { q, category, minPrice, maxPrice, sort } = req.query as Record<string, string>;

  const games = await prisma.game.findMany({
    where: {
      status: "APPROVED",
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { categories: { some: { slug: category } } } : {}),
      ...(minPrice || maxPrice
        ? {
            priceTHB: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
    },
    include: {
      categories: { select: { name: true, slug: true } },
      developer: { select: { studioName: true } },
      reviews: { select: { rating: true } },
    },
    orderBy:
      sort === "price_asc"
        ? { priceTHB: "asc" }
        : sort === "price_desc"
          ? { priceTHB: "desc" }
          : { publishedAt: "desc" },
  });

  res.json(
    games.map(({ reviews, ...game }) => ({
      ...game,
      reviewCount: reviews.length,
      avgRating: reviews.length
        ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2))
        : null,
    }))
  );
});

/** GET /api/games/:slug — รายละเอียดเกม */
gamesRouter.get("/:slug", optionalAuth, async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { slug: req.params.slug },
    include: {
      categories: true,
      screenshots: { orderBy: { order: "asc" } },
      developer: { select: { id: true, studioName: true, description: true } },
      reviews: {
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          replies: { include: { author: { select: { displayName: true, role: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!game || (game.status !== "APPROVED" && req.auth?.role !== "ADMIN")) {
    return res.status(404).json({ error: "ไม่พบเกมนี้" });
  }
  res.json(game);
});

/** POST /api/games — ผู้พัฒนาอัปโหลดเกม (ไฟล์ไม่เกิน 200 MB) */
gamesRouter.post(
  "/",
  requireAuth,
  requireRole("DEVELOPER"),
  gameUpload.single("gameFile"),
  async (req, res) => {
    const profile = await prisma.developerProfile.findUnique({
      where: { userId: req.auth!.userId },
    });
    if (!profile) return res.status(404).json({ error: "ไม่พบโปรไฟล์ผู้พัฒนา" });
    if (profile.status !== "APPROVED") {
      return res.status(403).json({ error: "บัญชีผู้พัฒนายังรอการอนุมัติจากผู้ดูแลระบบ" });
    }

    const { title, slug, description, priceTHB, minSpec, recSpec } = req.body;
    if (!title || !slug || !description || priceTHB === undefined) {
      return res.status(400).json({ error: "กรอกข้อมูลเกมให้ครบ (title, slug, description, priceTHB)" });
    }

    const game = await prisma.game.create({
      data: {
        title,
        slug,
        description,
        priceTHB,
        minSpec,
        recSpec,
        developerId: profile.id,
        status: "PENDING", // รอ admin ตรวจสอบก่อนวางจำหน่าย
        fileKey: req.file?.filename,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
      },
    });

    res.status(201).json(game);
  }
);

/** GET /api/games/mine/list — เกมของผู้พัฒนาคนนี้ + สถานะอนุมัติ + ยอดขาย */
gamesRouter.get("/mine/list", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  const profile = await prisma.developerProfile.findUnique({
    where: { userId: req.auth!.userId },
  });
  if (!profile) return res.status(404).json({ error: "ไม่พบโปรไฟล์ผู้พัฒนา" });

  const games = await prisma.game.findMany({
    where: { developerId: profile.id },
    include: {
      orderItems: { where: { order: { status: "PAID" } }, select: { priceTHB: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    games.map(({ orderItems, ...game }) => ({
      ...game,
      unitsSold: orderItems.length,
      revenueTHB: orderItems.reduce((sum, item) => sum + Number(item.priceTHB), 0),
    }))
  );
});
