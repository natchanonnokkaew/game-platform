import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { LockIcon } from "../components/icons";
import { homeFor, useAuth } from "../store/auth";

const STATS = [
  { value: "126", label: "เกมบนแพลตฟอร์ม" },
  { value: "3,400+", label: "ผู้เล่น" },
  { value: "87", label: "ผู้พัฒนาไทย" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  /** หน้าที่ผู้ใช้พยายามเข้าก่อนถูกส่งมาหน้านี้ */
  const from = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setBusy(true);
    try {
      const me = await login(email.trim(), password, remember);
      navigate(from ?? homeFor(me.role), { replace: true });
    } catch (err) {
      // ข้อความจาก backend เช่น "อีเมลหรือรหัสผ่านไม่ถูกต้อง" หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้
      setError(
        err instanceof TypeError
          ? "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่า backend เปิดอยู่ที่พอร์ต 4000"
          : err instanceof Error
            ? err.message
            : "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      altPrompt="ยังไม่มีบัญชี?"
      altLabel="สมัครสมาชิก"
      altTo="/register"
      heading="ยินดีต้อนรับกลับ นักเล่นเกม"
      subheading="เข้าสู่ระบบเพื่อดาวน์โหลดเกมในคลัง รับ License Key และร่วมพูดคุยในคอมมูนิตี้"
      aside={
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 8 }}>
          {STATS.map((s) => (
            <div key={s.label} className="panel" style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600 }}>{s.value}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div>
        <h1 style={{ fontSize: 34, fontWeight: 700 }}>เข้าสู่ระบบ</h1>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          ใช้อีเมลที่สมัครไว้
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert--danger">
          <b style={{ color: "var(--danger-fg)" }}>!</b>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ gap: 18 }}>
        <div className="field">
          <label htmlFor="login-id">อีเมล</label>
          <input
            id="login-id"
            type="email"
            autoComplete="email"
            placeholder="natchanon@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">รหัสผ่าน</label>
          <div style={{ position: "relative" }}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 72 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 8,
                top: 7,
                height: 34,
                padding: "0 10px",
                border: "none",
                background: "transparent",
                color: "var(--accent)",
                font: "inherit",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </div>

        <div className="row row--between">
          <label className="radio-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            จดจำฉันไว้ 7 วัน
          </label>
          <Link to="/forgot-password" style={{ fontSize: 15 }}>
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="auth__divider">หรือ</div>

      <Link to="/" className="btn btn--secondary btn--block">
        เข้าชมแบบผู้เยี่ยมชม
      </Link>

      <p className="muted" style={{ margin: 0, textAlign: "center", fontSize: 15 }}>
        ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
      </p>

      <p className="muted" style={{ margin: 0, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
        <LockIcon />
        เชื่อมต่อผ่าน HTTPS · รหัสผ่านถูกเข้ารหัสด้วย bcrypt
      </p>
    </AuthShell>
  );
}
