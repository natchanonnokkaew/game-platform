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

// ---------- สื่อประกอบเกม: ภาพหน้าปก ภาพหน้าจอ และวิดีโอแนะนำ ----------
// เก็บแยกในโฟลเดอร์ uploads/media และเปิดให้ดูได้สาธารณะที่ /api/media/<ชื่อไฟล์>
// (ไฟล์เกมยังเป็นไฟล์ส่วนตัว ดาวน์โหลดได้เฉพาะเจ้าของสิทธิ์ผ่าน /api/library)

export const MEDIA_URL_PREFIX = "/api/media/";
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // ภาพละไม่เกิน 5 MB
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // วิดีโอไม่เกิน 100 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

const mediaDir = path.join(uploadDir, "media");
fs.mkdirSync(mediaDir, { recursive: true });

/** error ที่ route แปลงเป็น 400 พร้อมข้อความภาษาไทย */
export class UploadError extends Error {
  code = "BAD_FILE_TYPE";
}

export const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, mediaDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.\w]/g, "");
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  // ช่อง "video" รับเฉพาะวิดีโอ ช่องอื่น (cover, screenshots) รับเฉพาะภาพ
  fileFilter: (_req, file, cb) => {
    const isVideoField = file.fieldname === "video";
    const allowed = isVideoField ? VIDEO_TYPES : IMAGE_TYPES;
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(
      new UploadError(
        isVideoField ? "รองรับเฉพาะวิดีโอ .mp4 หรือ .webm" : "รองรับเฉพาะภาพ .jpg .png .webp หรือ .gif"
      )
    );
  },
  limits: { fileSize: VIDEO_MAX_BYTES },
});

/** แปลง URL ของสื่อที่อัปโหลดกลับเป็นตำแหน่งไฟล์ (null ถ้าเป็นลิงก์ภายนอก เช่น YouTube) */
function mediaPath(url: string | null | undefined): string | null {
  if (!url || !url.startsWith(MEDIA_URL_PREFIX)) return null;
  return path.join(mediaDir, path.basename(url));
}

/** ลบไฟล์สื่อเดิมเมื่อถูกแทนที่หรือถูกลบ (ไม่ทำอะไรถ้าเป็นลิงก์ภายนอก) */
export async function removeMedia(url: string | null | undefined) {
  const file = mediaPath(url);
  if (file) await fs.promises.unlink(file).catch(() => undefined);
}

/** ลบไฟล์ที่เพิ่งอัปโหลดเมื่อคำขอไม่ผ่านการตรวจ */
export async function discardFiles(files: Express.Multer.File[] | undefined) {
  await Promise.all((files ?? []).map((f) => fs.promises.unlink(f.path).catch(() => undefined)));
}

export const mediaUrl = (file: Express.Multer.File) => MEDIA_URL_PREFIX + file.filename;

export { mediaDir };
