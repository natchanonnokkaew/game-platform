import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, auth, type AuthResponse, type Me, type Role } from "../lib/api";

/**
 * สถานะการเข้าสู่ระบบของทั้งแอป
 *   - เปิดเว็บมาแล้วมี token อยู่ → เรียก GET /api/auth/me เพื่อดึงข้อมูลผู้ใช้
 *   - token หมดอายุหรือใช้ไม่ได้ → ลบ token แล้วถือว่ายังไม่ได้เข้าสู่ระบบ
 */

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  role: "PLAYER" | "DEVELOPER";
  studioName?: string;
}

interface AuthValue {
  user: Me | null;
  /** กำลังตรวจ token ตอนเปิดเว็บ */
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<Me>;
  register: (input: RegisterInput) => Promise<Me>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

/** หน้าแรกที่เหมาะกับแต่ละบทบาทหลังเข้าสู่ระบบ */
export function homeFor(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "DEVELOPER") return "/developer";
  return "/library";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(() => Boolean(auth.token));

  const loadMe = useCallback(async () => {
    const me = await api<Me>("/auth/me");
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    if (!auth.token) return;
    loadMe()
      .catch(() => {
        auth.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      auth.set(res.token, remember);
      return loadMe();
    },
    [loadMe]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      auth.set(res.token, true);
      return loadMe();
    },
    [loadMe]
  );

  const logout = useCallback(() => {
    auth.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ต้องอยู่ภายใน <AuthProvider>");
  return ctx;
}

/**
 * ครอบหน้าที่ต้องเข้าสู่ระบบก่อน
 *   - ยังไม่เข้าสู่ระบบ → ส่งไปหน้า /login แล้วกลับมาหน้าเดิมหลังเข้าสู่ระบบ
 *   - บทบาทไม่ตรง → ส่งกลับหน้าแรกของบทบาทนั้น (ตรงกับที่ backend ตอบ 403)
 */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="muted" style={{ padding: 32 }}>
        กำลังตรวจสอบการเข้าสู่ระบบ…
      </p>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
