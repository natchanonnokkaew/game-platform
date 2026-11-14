import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

const BENEFITS = [
  "ซื้อเกมและรับ License Key ทันที",
  "เก็บเกมไว้ในคลัง ดาวน์โหลดซ้ำได้ตลอด",
  "เขียนรีวิวและให้คะแนนเกมที่เล่นจบ",
  "โพสต์ ถามตอบ และหาเพื่อนเล่นในคอมมูนิตี้",
  "ผู้พัฒนา: อัปโหลดและขายเกมของตัวเอง",
];

type Role = "PLAYER" | "DEVELOPER";

function scorePassword(pw: string) {
  const checks = {
    length: pw.length >= 8,
    digit: /\d/.test(pw),
    letter: /[a-zA-Z]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const labels = ["อ่อนมาก", "อ่อน", "พอใช้", "ดี", "แข็งแรงมาก"];
  return { checks, passed, label: labels[passed], pct: `${(passed / 4) * 100}%` };
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("PLAYER");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => scorePassword(password), [password]);
  const matches = confirm.length > 0 && confirm === password;
  const usernameOk = /^[a-z0-9_]{3,20}$/.test(username);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!displayName.trim() || !username.trim() || !email.trim()) {
      setError("กรุณากรอกชื่อที่แสดง ชื่อผู้ใช้ และอีเมลให้ครบ");
      return;
    }
    if (!strength.checks.length) {
      setError("รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (!matches) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (!accepted) {
      setError("กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก");
      return;
    }

    setBusy(true);
    try {
      // TODO: ต่อกับ POST /api/auth/register
      await new Promise((r) => setTimeout(r, 400));
      navigate("/login");
    } catch {
      setError("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  const strengthColor =
    strength.passed <= 1 ? "var(--danger-fg)" : strength.passed <= 2 ? "var(--warn-fg)" : "var(--accent)";

  return (
    <AuthShell
      altPrompt="มีบัญชีอยู่แล้ว?"
      altLabel="เข้าสู่ระบบ"
      altTo="/login"
      heading="มาเป็นส่วนหนึ่งของ HAFTSTAR"
      subheading="สร้างบัญชีฟรี แล้วเริ่มสะสมเกมของคุณได้ทันที"
      aside={
        <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {BENEFITS.map((b) => (
            <li key={b} className="row" style={{ gap: 12, flexWrap: "nowrap", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", flex: "none" }}>✦</span>
              <span className="dim">{b}</span>
            </li>
          ))}
        </ul>
      }
    >
      <div>
        <h1 style={{ fontSize: 34, fontWeight: 700 }}>สมัครสมาชิก</h1>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          สร้างบัญชีฟรี ใช้เวลาไม่ถึงนาที
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert--danger">
          <b style={{ color: "var(--danger-fg)" }}>!</b>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ gap: 18 }}>
        <fieldset>
          <legend style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}>
            สมัครในฐานะ
          </legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(
              [
                ["PLAYER", "ผู้เล่น", "ซื้อและเล่นเกม รีวิว และร่วมคอมมูนิตี้"],
                ["DEVELOPER", "ผู้พัฒนา", "อัปโหลดและขายเกม · ต้องรออนุมัติจากผู้ดูแลระบบ"],
              ] as [Role, string, string][]
            ).map(([value, label, hint]) => (
              <label
                key={value}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 16,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: role === value ? "var(--surface-input)" : "transparent",
                  border: `1px solid ${role === value ? "var(--accent)" : "var(--border-soft)"}`,
                }}
              >
                <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                  <input
                    type="radio"
                    name="role"
                    checked={role === value}
                    onChange={() => setRole(value)}
                  />
                  <b>{label}</b>
                </span>
                <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
                  {hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="reg-name">ชื่อที่แสดง</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="ณัฐชนน นกแก้ว"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-username">ชื่อผู้ใช้</label>
            <div style={{ position: "relative" }}>
              <span
                aria-hidden="true"
                style={{ position: "absolute", left: 16, top: 11, color: "var(--text-muted)" }}
              >
                @
              </span>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                placeholder="natchanon"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                style={{ paddingLeft: 34 }}
              />
            </div>
            {username.length > 0 && (
              <span
                className="field__hint"
                style={{ color: usernameOk ? "var(--ok-fg)" : "var(--warn-fg)" }}
              >
                {usernameOk ? "✓ ใช้ชื่อนี้ได้" : "ใช้ a-z, 0-9 และ _ ความยาว 3–20 ตัว"}
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="reg-email">อีเมล</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="natchanon@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="field__hint">เราจะส่งลิงก์ยืนยันไปที่อีเมลนี้</span>
        </div>

        <div className="field">
          <label htmlFor="reg-password">รหัสผ่าน</label>
          <div style={{ position: "relative" }}>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
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

          <div className="row" style={{ gap: 12, flexWrap: "nowrap", marginTop: 4 }}>
            <span
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: "var(--surface-input)",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: strength.pct,
                  background: strengthColor,
                  transition: "width .2s",
                }}
              />
            </span>
            <span className="field__hint" style={{ whiteSpace: "nowrap" }}>
              ความแข็งแรง: {password ? strength.label : "—"}
            </span>
          </div>

          <div className="row" style={{ gap: 12, fontSize: 13 }}>
            {(
              [
                [strength.checks.length, "อย่างน้อย 8 ตัวอักษร"],
                [strength.checks.digit, "มีตัวเลข"],
                [strength.checks.letter, "มีตัวอักษร"],
                [strength.checks.special, "มีอักขระพิเศษ (แนะนำ)"],
              ] as [boolean, string][]
            ).map(([ok, label]) => (
              <span key={label} style={{ color: ok ? "var(--ok-fg)" : "var(--text-muted)" }}>
                {ok ? "✓" : "○"} {label}
              </span>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="reg-confirm">ยืนยันรหัสผ่าน</label>
          <input
            id="reg-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm.length > 0 && (
            <span className="field__hint" style={{ color: matches ? "var(--ok-fg)" : "var(--danger-fg)" }}>
              {matches ? "✓ รหัสผ่านตรงกัน" : "✗ รหัสผ่านยังไม่ตรงกัน"}
            </span>
          )}
        </div>

        <label className="radio-row" style={{ alignItems: "flex-start", gap: 12 }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span style={{ fontSize: 15 }}>
            ฉันยอมรับ<a href="#terms">เงื่อนไขการใช้งาน</a>และ<a href="#privacy">นโยบายความเป็นส่วนตัว</a>
          </span>
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "กำลังสร้างบัญชี…" : "สร้างบัญชี"}
        </button>
      </form>

      <p className="muted" style={{ margin: 0, textAlign: "center", fontSize: 15 }}>
        มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
      </p>
    </AuthShell>
  );
}
