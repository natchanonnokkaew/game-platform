import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { LockIcon } from "../components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    // TODO: ต่อกับ POST /api/auth/forgot-password
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
    setSent(true);
  }

  return (
    <AuthShell
      altPrompt="นึกรหัสผ่านออกแล้ว?"
      altLabel="เข้าสู่ระบบ"
      altTo="/login"
      heading="ลืมรหัสผ่านใช่ไหม"
      subheading="กรอกอีเมลที่สมัครไว้ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้"
      aside={
        <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "ลิงก์มีอายุ 30 นาที ใช้ได้ครั้งเดียว",
            "ถ้าไม่เจออีเมล ลองดูในโฟลเดอร์ Junk หรือ Spam",
            "รหัสผ่านเดิมยังใช้ได้จนกว่าจะตั้งรหัสใหม่สำเร็จ",
          ].map((t) => (
            <li key={t} className="row" style={{ gap: 12, flexWrap: "nowrap", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", flex: "none" }}>✦</span>
              <span className="dim">{t}</span>
            </li>
          ))}
        </ul>
      }
    >
      <div>
        <h1 style={{ fontSize: 34, fontWeight: 700 }}>ตั้งรหัสผ่านใหม่</h1>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          ใช้อีเมลที่ผูกไว้กับบัญชีของคุณ
        </p>
      </div>

      {sent ? (
        <>
          <div role="status" className="alert alert--ok">
            <span>
              ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ <b>{email}</b> แล้ว กรุณาตรวจสอบกล่องจดหมาย
            </span>
          </div>
          <Link to="/login" className="btn btn--primary btn--block">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => setSent(false)}
          >
            ส่งไปอีเมลอื่น
          </button>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fp-email">อีเมล</label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                placeholder="natchanon@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? "กำลังส่ง…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
            </button>
          </form>

          <p className="muted" style={{ margin: 0, textAlign: "center", fontSize: 15 }}>
            จำรหัสผ่านได้แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
          </p>
        </>
      )}

      <p className="muted" style={{ margin: 0, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
        <LockIcon />
        ลิงก์ตั้งรหัสผ่านใหม่มีอายุ 30 นาที และใช้ได้ครั้งเดียว
      </p>
    </AuthShell>
  );
}
