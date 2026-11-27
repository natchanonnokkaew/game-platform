import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth";
import {
  IMAGE_MAX_BYTES,
  discardFiles,
  gameUpload,
  mediaUpload,
  mediaUrl,
  removeMedia,
} from "../lib/upload";

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
      categories: { select: { name: true, slug: true } },
      screenshots: { orderBy: { order: "asc" } },
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

/* =====================================================================
 * แก้ไขเกมและสื่อประกอบ (ภาพหน้าปก ภาพหน้าจอ วิดีโอ) — เฉพาะผู้พัฒนาเจ้าของเกม
 *
 *   PATCH  /api/games/:id                         แก้ข้อมูลเกม
 *   POST   /api/games/:id/cover                   อัปโหลด/แทนที่ภาพหน้าปก (ช่อง "cover")
 *   DELETE /api/games/:id/cover                   ลบภาพหน้าปก
 *   POST   /api/games/:id/screenshots             เพิ่มภาพหน้าจอ (ช่อง "screenshots" รวมไม่เกิน 5 ภาพ)
 *   DELETE /api/games/:id/screenshots/:shotId     ลบภาพหน้าจอ
 *   POST   /api/games/:id/video                   อัปโหลด/แทนที่วิดีโอแนะนำ (ช่อง "video")
 *   DELETE /api/games/:id/video                   ลบวิดีโอแนะนำ
 *
 * เกมที่ถูกปฏิเสธ (REJECTED) เมื่อแก้ไขจะกลับเข้าคิวรอตรวจสอบ (PENDING) อีกครั้ง
 * เกมที่อนุมัติแล้ว (APPROVED) แก้ไขได้และมีผลทันที
 * ===================================================================== */

const MAX_SCREENSHOTS = 5;

/** ข้อมูลเกมแบบเต็มที่ส่งกลับหลังแก้ไข */
const fullGame = (id: string) =>
  prisma.game.findUnique({
    where: { id },
    include: {
      categories: { select: { name: true, slug: true } },
      screenshots: { orderBy: { order: "asc" } },
    },
  });

/** สถานะหลังผู้พัฒนาแก้ไข: เกมที่ถูกปฏิเสธจะถูกส่งกลับไปรอตรวจสอบ */
const statusAfterEdit = (status: string) =>
  status === "REJECTED" ? { status: "PENDING" as const, rejectNote: null } : {};

/** ตรวจว่าเกม :id เป็นของผู้พัฒนาที่ล็อกอินอยู่ (ทำก่อนรับไฟล์ จะได้ไม่ต้องเก็บไฟล์ที่ไม่มีสิทธิ์) */
async function ownGame(req: Request, res: Response, next: NextFunction) {
  const profile = await prisma.developerProfile.findUnique({ where: { userId: req.auth!.userId } });
  if (!profile) return res.status(404).json({ error: "ไม่พบโปรไฟล์ผู้พัฒนา" });

  const game = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: { screenshots: { orderBy: { order: "asc" } } },
  });
  if (!game) return res.status(404).json({ error: "ไม่พบเกมนี้" });
  if (game.developerId !== profile.id) {
    return res.status(403).json({ error: "แก้ไขได้เฉพาะเกมของตัวเอง" });
  }
  res.locals.game = game;
  next();
}

type OwnGame = Prisma.GameGetPayload<{ include: { screenshots: true } }>;
const gameOf = (res: Response) => res.locals.game as OwnGame;

/** เรียก multer แล้วแปลง error เป็นข้อความภาษาไทยที่เหมาะกับสื่อประกอบเกม */
function receive(handler: RequestHandler): RequestHandler {
  return (req, res, next) =>
    handler(req, res, (err?: unknown) => {
      if (!err) return next();
      const e = err as { code?: string; message?: string };
      if (e.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "ไฟล์ใหญ่เกินกำหนด (ภาพไม่เกิน 5 MB · วิดีโอไม่เกิน 100 MB)" });
      }
      if (e.code === "LIMIT_UNEXPECTED_FILE" || e.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: `ชื่อช่องไฟล์ไม่ถูกต้อง หรือส่งภาพเกิน ${MAX_SCREENSHOTS} ภาพ` });
      }
      if (e.code === "BAD_FILE_TYPE") return res.status(400).json({ error: e.message });
      next(err);
    });
}

/** ภาพต้องไม่เกิน 5 MB (multer จำกัดรวมไว้ที่ 100 MB สำหรับวิดีโอ จึงตรวจภาพซ้ำที่นี่) */
async function imagesTooLarge(files: Express.Multer.File[], res: Response) {
  if (files.every((f) => f.size <= IMAGE_MAX_BYTES)) return false;
  await discardFiles(files);
  res.status(413).json({ error: "ภาพต้องมีขนาดไม่เกิน 5 MB ต่อภาพ" });
  return true;
}

const asDeveloper: RequestHandler[] = [requireAuth, requireRole("DEVELOPER"), ownGame];

const editSchema = z
  .object({
    title: z.string().trim().min(1, "กรุณากรอกชื่อเกม").max(120, "ชื่อเกมยาวเกิน 120 ตัวอักษร"),
    description: z.string().trim().min(1, "กรุณากรอกคำอธิบายเกม"),
    priceTHB: z.coerce.number().min(0, "ราคาต้องเป็นตัวเลขไม่ติดลบ").max(99999, "ราคาสูงเกินไป"),
    minSpec: z.string().trim().nullable(),
    recSpec: z.string().trim().nullable(),
    /** ลิงก์วิดีโอภายนอก เช่น YouTube (null = ลบวิดีโอ) */
    videoUrl: z
      .string()
      .trim()
      .url("ลิงก์วิดีโอไม่ถูกต้อง")
      .refine((u) => /^https?:\/\//.test(u), "ลิงก์วิดีโอต้องขึ้นต้นด้วย http:// หรือ https://")
      .nullable(),
    /** slug ของหมวดหมู่ทั้งหมดที่ต้องการ (แทนที่ของเดิม) */
    categories: z.array(z.string()).max(5, "เลือกหมวดหมู่ได้ไม่เกิน 5 หมวด"),
  })
  .partial()
  .strict(); // ห้ามส่ง status, developerId, fileKey ฯลฯ มาแก้เอง

/** PATCH /api/games/:id — แก้ข้อมูลเกม (ส่งเฉพาะช่องที่ต้องการแก้) */
gamesRouter.patch("/:id", ...asDeveloper, async (req, res) => {
  const parsed = editSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { categories, ...fields } = parsed.data;
  const game = gameOf(res);

  let categoryIds: { id: string }[] | undefined;
  if (categories) {
    const found = await prisma.category.findMany({ where: { slug: { in: categories } }, select: { id: true } });
    if (found.length !== new Set(categories).size) {
      return res.status(400).json({ error: "มีหมวดหมู่ที่ไม่อยู่ในระบบ" });
    }
    categoryIds = found;
  }

  await prisma.game.update({
    where: { id: game.id },
    data: {
      ...fields,
      ...(categoryIds ? { categories: { set: categoryIds } } : {}),
      ...statusAfterEdit(game.status),
    },
  });

  // เปลี่ยนเป็นลิงก์ใหม่หรือลบวิดีโอ → ลบไฟล์วิดีโอที่เคยอัปโหลดไว้
  if (fields.videoUrl !== undefined && fields.videoUrl !== game.videoUrl) await removeMedia(game.videoUrl);

  res.json(await fullGame(game.id));
});

/** POST /api/games/:id/cover — อัปโหลดหรือแทนที่ภาพหน้าปก (multipart ช่อง "cover") */
gamesRouter.post("/:id/cover", ...asDeveloper, receive(mediaUpload.single("cover")), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "กรุณาเลือกไฟล์ภาพหน้าปก (ช่อง cover)" });
  if (await imagesTooLarge([req.file], res)) return;
  const game = gameOf(res);

  await prisma.game.update({
    where: { id: game.id },
    data: { coverUrl: mediaUrl(req.file), ...statusAfterEdit(game.status) },
  });
  await removeMedia(game.coverUrl);
  res.status(201).json(await fullGame(game.id));
});

/** DELETE /api/games/:id/cover — ลบภาพหน้าปก (หน้าร้านจะใช้ภาพปกจำลองแทน) */
gamesRouter.delete("/:id/cover", ...asDeveloper, async (_req, res) => {
  const game = gameOf(res);
  await prisma.game.update({ where: { id: game.id }, data: { coverUrl: null, ...statusAfterEdit(game.status) } });
  await removeMedia(game.coverUrl);
  res.json(await fullGame(game.id));
});

/** POST /api/games/:id/screenshots — เพิ่มภาพหน้าจอ (multipart ช่อง "screenshots" ได้หลายไฟล์ รวมไม่เกิน 5 ภาพ) */
gamesRouter.post(
  "/:id/screenshots",
  ...asDeveloper,
  receive(mediaUpload.array("screenshots", MAX_SCREENSHOTS)),
  async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) return res.status(400).json({ error: "กรุณาเลือกภาพหน้าจออย่างน้อย 1 ภาพ (ช่อง screenshots)" });
    if (await imagesTooLarge(files, res)) return;

    const game = gameOf(res);
    const remaining = MAX_SCREENSHOTS - game.screenshots.length;
    if (files.length > remaining) {
      await discardFiles(files);
      return res.status(400).json({
        error: remaining > 0 ? `เพิ่มภาพหน้าจอได้อีก ${remaining} ภาพ (รวมไม่เกิน ${MAX_SCREENSHOTS} ภาพ)` : `มีภาพหน้าจอครบ ${MAX_SCREENSHOTS} ภาพแล้ว`,
      });
    }

    const start = game.screenshots.length;
    await prisma.$transaction([
      prisma.gameScreenshot.createMany({
        data: files.map((f, i) => ({ gameId: game.id, url: mediaUrl(f), order: start + i })),
      }),
      prisma.game.update({ where: { id: game.id }, data: statusAfterEdit(game.status) }),
    ]);
    res.status(201).json(await fullGame(game.id));
  }
);

/** DELETE /api/games/:id/screenshots/:shotId — ลบภาพหน้าจอ แล้วเรียงลำดับภาพที่เหลือใหม่ */
gamesRouter.delete("/:id/screenshots/:shotId", ...asDeveloper, async (req, res) => {
  const game = gameOf(res);
  const shot = game.screenshots.find((s) => s.id === req.params.shotId);
  if (!shot) return res.status(404).json({ error: "ไม่พบภาพหน้าจอนี้" });

  const rest = game.screenshots.filter((s) => s.id !== shot.id);
  await prisma.$transaction([
    prisma.gameScreenshot.delete({ where: { id: shot.id } }),
    ...rest.map((s, i) => prisma.gameScreenshot.update({ where: { id: s.id }, data: { order: i } })),
    prisma.game.update({ where: { id: game.id }, data: statusAfterEdit(game.status) }),
  ]);
  await removeMedia(shot.url);
  res.json(await fullGame(game.id));
});

/** POST /api/games/:id/video — อัปโหลดหรือแทนที่วิดีโอแนะนำ (multipart ช่อง "video" · .mp4/.webm ไม่เกิน 100 MB) */
gamesRouter.post("/:id/video", ...asDeveloper, receive(mediaUpload.single("video")), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "กรุณาเลือกไฟล์วิดีโอ (ช่อง video)" });
  const game = gameOf(res);

  await prisma.game.update({
    where: { id: game.id },
    data: { videoUrl: mediaUrl(req.file), ...statusAfterEdit(game.status) },
  });
  await removeMedia(game.videoUrl);
  res.status(201).json(await fullGame(game.id));
});

/** DELETE /api/games/:id/video — ลบวิดีโอแนะนำ (ทั้งไฟล์ที่อัปโหลดและลิงก์ภายนอก) */
gamesRouter.delete("/:id/video", ...asDeveloper, async (_req, res) => {
  const game = gameOf(res);
  await prisma.game.update({ where: { id: game.id }, data: { videoUrl: null, ...statusAfterEdit(game.status) } });
  await removeMedia(game.videoUrl);
  res.json(await fullGame(game.id));
});
