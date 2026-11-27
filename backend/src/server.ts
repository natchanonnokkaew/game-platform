import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { mediaDir } from "./lib/upload";
import { authRouter } from "./routes/auth";
import { gamesRouter } from "./routes/games";
import { cartRouter, wishlistRouter } from "./routes/cart";
import { ordersRouter } from "./routes/orders";
import { libraryRouter } from "./routes/library";
import { reviewsRouter } from "./routes/reviews";
import { adminRouter } from "./routes/admin";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

// ภาพหน้าปก ภาพหน้าจอ และวิดีโอแนะนำเกม (สาธารณะ) — ไฟล์เกมไม่อยู่ในโฟลเดอร์นี้
app.use("/api/media", express.static(mediaDir, { maxAge: "7d" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRouter);
app.use("/api/games", gamesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/library", libraryRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/admin", adminRouter);

// ตัวจับ error กลาง — ต้องอยู่ท้ายสุด
app.use(
  (
    err: Error & { code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "ไฟล์เกมใหญ่เกิน 200 MB" });
    }
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
);

app.listen(env.port, () => {
  console.log(`API พร้อมใช้งานที่ http://localhost:${env.port}`);
});
