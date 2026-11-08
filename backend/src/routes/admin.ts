import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));

/** GET /api/admin/games/pending — เกมที่รอตรวจสอบ */
adminRouter.get("/games/pending", async (_req, res) => {
  res.json(
    await prisma.game.findMany({
      where: { status: "PENDING" },
      include: { developer: { select: { studioName: true } } },
      orderBy: { createdAt: "asc" },
    })
  );
});

/** PATCH /api/admin/games/:id/review  { approve: boolean, note?: string } */
adminRouter.patch("/games/:id/review", async (req, res) => {
  const approve = Boolean(req.body?.approve);
  const game = await prisma.game.update({
    where: { id: req.params.id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      publishedAt: approve ? new Date() : null,
      rejectNote: approve ? null : (req.body?.note ?? "ไม่ผ่านเกณฑ์การตรวจสอบ"),
    },
  });
  res.json(game);
});

/** PATCH /api/admin/developers/:id/review — อนุมัติบัญชีผู้พัฒนา */
adminRouter.patch("/developers/:id/review", async (req, res) => {
  res.json(
    await prisma.developerProfile.update({
      where: { id: req.params.id },
      data: { status: req.body?.approve ? "APPROVED" : "REJECTED" },
    })
  );
});

/** GET /api/admin/users */
adminRouter.get("/users", async (_req, res) => {
  res.json(
    await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        developerProfile: { select: { id: true, studioName: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  );
});

/** GET /api/admin/stats — สรุปยอดขายรวมของแพลตฟอร์ม */
adminRouter.get("/stats", async (_req, res) => {
  const [users, games, pendingGames, paidOrders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.game.count({ where: { status: "APPROVED" } }),
    prisma.game.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalTHB: true } }),
  ]);

  res.json({
    users,
    approvedGames: games,
    pendingGames,
    paidOrders,
    totalRevenueTHB: Number(revenue._sum.totalTHB ?? 0),
  });
});

/** GET /api/admin/orders */
adminRouter.get("/orders", async (_req, res) => {
  res.json(
    await prisma.order.findMany({
      include: {
        user: { select: { email: true, displayName: true } },
        items: { include: { game: { select: { title: true } } } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
  );
});
