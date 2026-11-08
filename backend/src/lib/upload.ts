import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "./env";

// ตอน deploy จริงจะเปลี่ยนไปเก็บบน AWS S3 — ตอนพัฒนาเก็บลงโฟลเดอร์ uploads/
const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

export const gameUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: env.maxGameFileBytes }, // 200 MB ตามขอบเขตโครงงาน
});

export { uploadDir };
