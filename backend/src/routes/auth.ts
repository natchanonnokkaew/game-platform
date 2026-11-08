import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, signToken } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"),
  displayName: z.string().min(2),
  role: z.enum(["PLAYER", "DEVELOPER"]).default("PLAYER"),
  studioName: z.string().min(2).optional(),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, displayName, role, studioName } = parsed.data;

  if (await prisma.user.findUnique({ where: { email } })) {
    return res.status(409).json({ error: "อีเมลนี้ถูกใช้แล้ว" });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      displayName,
      role,
      // สมัครเป็นผู้พัฒนา = สร้างโปรไฟล์สถานะ PENDING รอ admin อนุมัติ
      developerProfile:
        role === "DEVELOPER"
          ? { create: { studioName: studioName ?? displayName } }
          : undefined,
    },
  });

  res.status(201).json({
    token: signToken({ userId: user.id, role: user.role }),
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "กรอกอีเมลและรหัสผ่าน" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }

  res.json({
    token: signToken({ userId: user.id, role: user.role }),
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      avatarUrl: true,
      developerProfile: { select: { id: true, studioName: true, status: true } },
    },
  });
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
  res.json(user);
});
