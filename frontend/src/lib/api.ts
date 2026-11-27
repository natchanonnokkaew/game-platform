// ตัวกลางเรียก API ตัวเดียวของทั้งแอป
// token เก็บใน localStorage เมื่อเลือก "จดจำฉันไว้" ไม่อย่างนั้นเก็บใน sessionStorage (ปิดแท็บแล้วหลุด)
const TOKEN_KEY = "gp_token";

function read(store: Storage) {
  try {
    return store.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const auth = {
  get token() {
    return read(localStorage) ?? read(sessionStorage);
  },
  set(token: string, remember = true) {
    auth.clear();
    try {
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
      /* เบราว์เซอร์ไม่อนุญาตให้เก็บ — ใช้งานต่อได้จนรีเฟรช */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ไม่มีอะไรต้องลบ */
    }
  },
};

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `เกิดข้อผิดพลาด (${res.status})`);
  return data as T;
}

// ---------- ชนิดข้อมูลที่ frontend/backend ใช้ร่วมกัน ----------

export type Role = "PLAYER" | "DEVELOPER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

/** ข้อมูลจาก GET /api/auth/me (มีโปรไฟล์ผู้พัฒนาถ้าเป็น DEVELOPER) */
export interface Me extends User {
  avatarUrl?: string | null;
  developerProfile?: { id: string; studioName: string; status: "PENDING" | "APPROVED" | "REJECTED" } | null;
}

/** คำตอบของ POST /api/auth/login และ /api/auth/register */
export interface AuthResponse {
  token: string;
  user: User;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceTHB: string;
  coverUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  avgRating?: number | null;
  reviewCount?: number;
  developer?: { studioName: string };
}
