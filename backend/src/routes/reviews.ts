import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const reviewsRouter = Router();

/** POST /api/reviews  { gameId, rating, body } — ต้องมีเกมในคลังก่อน */
reviewsRouter.post("/", requireAuth, async (req, res) => {
  const { gameId, rating, body } = req.body ?? {};
  const userId = req.auth!.userId;

  if (!gameId || !body || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "ต้องระบุ gameId, body และ rating (1-5)" });
  }

  const owns = await prisma.libraryItem.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (!owns) return res.status(403).json({ error: "รีวิวได้เฉพาะเกมที่มีอยู่ในคลังของคุณ" });

  const review = await prisma.review.upsert({
    where: { userId_gameId: { userId, gameId } },
    create: { userId, gameId, rating, body },
    update: { rating, body },
  });
  res.status(201).json(review);
});

/** POST /api/reviews/:id/reply — ผู้พัฒนา/แอดมินตอบกลับรีวิว */
reviewsRouter.post("/:id/reply", requireAuth, requireRole("DEVELOPER", "ADMIN"), async (req, res) => {
  const { body } = req.body ?? {};
  if (!body) return res.status(400).json({ error: "ต้องระบุข้อความตอบกลับ" });

  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
    include: { game: { include: { developer: true } } },
  });
  if (!review) return res.status(404).json({ error: "ไม่พบรีวิวนี้" });

  // ผู้พัฒนาตอบได้แค่รีวิวของเกมตัวเอง
  if (req.auth!.role === "DEVELOPER" && review.game.developer.userId !== req.auth!.userId) {
    return res.status(403).json({ error: "ตอบกลับได้เฉพาะรีวิวของเกมตัวเอง" });
  }

  res.status(201).json(
    await prisma.reviewReply.create({
      data: { reviewId: review.id, authorId: req.auth!.userId, body },
    })
  );
});

/** DELETE /api/reviews/:id — ลบรีวิวของตัวเอง (หรือแอดมินลบได้) */
reviewsRouter.delete("/:id", requireAuth, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: "ไม่พบรีวิวนี้" });
  if (review.userId !== req.auth!.userId && req.auth!.role !== "ADMIN") {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ลบรีวิวนี้" });
  }
  await prisma.review.delete({ where: { id: review.id } });
  res.status(204).end();
});
