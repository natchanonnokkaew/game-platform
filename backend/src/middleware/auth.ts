import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export type Role = "PLAYER" | "DEVELOPER" | "ADMIN";

export interface AuthPayload {
  userId: string;
  role: Role;
}

// ขยาย Request ของ Express ให้มี req.auth
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

/** ต้องล็อกอินก่อน */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" });
  }
  try {
    req.auth = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุ" });
  }
}

/** จำกัดตามบทบาท เช่น requireRole("ADMIN") */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" });
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" });
    }
    next();
  };
}

/** อ่าน token ถ้ามี แต่ไม่บังคับ — ใช้กับหน้าที่ guest ดูได้ */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.auth = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    } catch {
      /* ไม่เป็นไร ถือว่าเป็น guest */
    }
  }
  next();
}
