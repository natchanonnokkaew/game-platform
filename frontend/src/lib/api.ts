// ตัวกลางเรียก API ตัวเดียวของทั้งแอป — เก็บ token ไว้ใน localStorage
const TOKEN_KEY = "gp_token";

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
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
