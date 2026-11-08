import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `ไม่พบค่า ${name} ใน .env — คัดลอก backend/.env.example เป็น backend/.env แล้วใส่ค่าให้ครบ`
    );
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxGameFileBytes: Number(process.env.MAX_GAME_FILE_MB ?? 200) * 1024 * 1024,
};
