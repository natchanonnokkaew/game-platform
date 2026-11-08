import path from "node:path";
import fs from "node:fs";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { uploadDir } from "../lib/upload";

export const libraryRouter = Router();
libraryRouter.use(requireAuth);

/** GET /api/library — คลังเกมส่วนตัว */
libraryRouter.get("/", async (req, res) => {
  const items = await prisma.libraryItem.findMany({
    where: { userId: req.auth!.userId },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          fileName: true,
          fileSize: true,
          developer: { select: { studioName: true } },
        },
      },
    },
    orderBy: { acquiredAt: "desc" },
  });

  const keys = await prisma.licenseKey.findMany({
    where: { userId: req.auth!.userId, revokedAt: null },
    select: { gameId: true, key: true },
  });
  const keyByGame = new Map(keys.map((k) => [k.gameId, k.key]));

  res.json(items.map((item) => ({ ...item, licenseKey: keyByGame.get(item.gameId) ?? null })));
});

/** GET /api/library/:gameId/download — ดาวน์โหลดไฟล์เกมที่ตัวเองเป็นเจ้าของสิทธิ์ */
libraryRouter.get("/:gameId/download", async (req, res) => {
  const { gameId } = req.params;
  const userId = req.auth!.userId;

  const entry = await prisma.libraryItem.findUnique({
    where: { userId_gameId: { userId, gameId } },
    include: { game: { select: { fileKey: true, fileName: true } } },
  });
  if (!entry) return res.status(403).json({ error: "คุณไม่มีสิทธิ์ดาวน์โหลดเกมนี้" });
  if (!entry.game.fileKey) return res.status(404).json({ error: "ยังไม่มีไฟล์เกมในระบบ" });

  const filePath = path.join(uploadDir, entry.game.fileKey);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "ไม่พบไฟล์เกมบนเซิร์ฟเวอร์" });

  await prisma.libraryItem.update({
    where: { id: entry.id },
    data: { downloadCount: { increment: 1 }, lastDownload: new Date() },
  });

  res.download(filePath, entry.game.fileName ?? entry.game.fileKey);
});
