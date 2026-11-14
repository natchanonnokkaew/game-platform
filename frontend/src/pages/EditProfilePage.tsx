import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PROFILE } from "../data/mock";

const AVATAR_COLORS: [string, string][] = [
  ["#3B5A9A", "น้ำเงิน"],
  ["#4A3B6B", "ม่วง"],
  ["#2E5B4F", "เขียวหัวเป็ด"],
  ["#5B3A2E", "น้ำตาล"],
  ["#6B2F4A", "ชมพูเข้ม"],
  ["#2E4A7A", "ฟ้าเข้ม"],
];

const ALL_GENRES = ["แอ็กชัน", "ผจญภัย", "RPG", "กลยุทธ์", "จำลอง", "ปริศนา", "แข่งรถ", "แคชวล"];
const MAX_GENRES = 3;
const BIO_LIMIT = 160;

const PRIVACY: [key: "pub" | "msgs" | "online", label: string, desc: string][] = [
  ["pub", "แสดงคลังเกมแบบสาธารณะ", "คนอื่นเห็นเกมที่คุณเป็นเจ้าของและเวลาที่เล่น"],
  ["msgs", "รับข้อความจากทุกคน", "ถ้าปิด จะรับข้อความเฉพาะเพื่อนเท่านั้น"],
  ["online", "แสดงสถานะออนไลน์", "เพื่อนจะเห็นว่าคุณกำลังเล่นเกมอะไร"],
];

const PW_LEVELS: [label: string, color: string, pct: string][] = [
  ["ยังไม่ได้กรอก", "#33507C", "0%"],
  ["อ่อน", "#FF8A8A", "25%"],
  ["พอใช้", "#F5C04A", "50%"],
  ["ดี", "#9BE15D", "75%"],
  ["แข็งแรงมาก", "#5BD49A", "100%"],
];

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <div className="row row--between" style={{ gap: 16, flexWrap: "nowrap", alignItems: "flex-start" }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="muted" style={{ fontSize: 13 }}>
          {desc}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          flex: "none",
          width: 48,
          height: 28,
          padding: 0,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          position: "relative",
          background: checked ? "#5BD49A" : "#33507C",
          boxShadow: checked ? "0 0 12px rgba(91,212,154,0.5)" : "none",
          transition: "background .15s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 25 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .15s",
          }}
        />
      </button>
    </div>
  );
}

export default function EditProfilePage() {
  const [name, setName] = useState(PROFILE.name);
  const [username, setUsername] = useState("natchanon");
  const [bio, setBio] = useState(PROFILE.bio);
  const [color, setColor] = useState("#3B5A9A");
  const [genres, setGenres] = useState<string[]>(["RPG", "ผจญภัย", "แข่งรถ"]);
  const [privacy, setPrivacy] = useState({ pub: true, msgs: false, online: true });
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saved, setSaved] = useState(false);

  const usernameOk = /^[a-z0-9_.]{3,20}$/.test(username);
  const mismatch = pw2.length > 0 && pw !== pw2;

  const strength = useMemo(() => {
    if (!pw) return PW_LEVELS[0];
    let score = 0;
    if (pw.length >= 8) score++;
    if (/\d/.test(pw) && /[A-Za-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    return PW_LEVELS[Math.max(1, score)];
  }, [pw]);

  function toggleGenre(g: string) {
    setSaved(false);
    setGenres((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g);
      if (prev.length >= MAX_GENRES) return prev;
      return [...prev, g];
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: ต่อกับ PATCH /api/auth/me
    setSaved(true);
  }

  const initial = name.trim().charAt(0) || PROFILE.initial;

  return (
    <>
      <nav aria-label="breadcrumb" className="muted" style={{ fontSize: 14 }}>
        <Link to="/profile" style={{ color: "var(--text-muted)" }}>
          โปรไฟล์
        </Link>
        {" / "}
        <span style={{ color: "var(--text)" }}>แก้ไขโปรไฟล์</span>
      </nav>

      <h1 className="page-title">แก้ไขโปรไฟล์</h1>

      {saved && (
        <div role="status" className="alert alert--ok">
          <span>บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว</span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <form
          aria-label="ฟอร์มแก้ไขโปรไฟล์"
          onSubmit={handleSubmit}
          style={{ flex: "999 1 560px", minWidth: 0, gap: 24 }}
        >
          {/* ---------- รูปโปรไฟล์ ---------- */}
          <section aria-labelledby="sec-photo" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 id="sec-photo" style={{ fontSize: 18, fontWeight: 600 }}>
              รูปโปรไฟล์และภาพปก
            </h2>
            <div className="row" style={{ gap: 20 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-head)",
                  fontSize: 40,
                  fontWeight: 600,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.3), 0 0 24px rgba(255,255,255,0.2)",
                }}
              >
                {initial}
              </span>
              <div className="row" style={{ gap: 10 }}>
                <label className="btn btn--secondary" style={{ cursor: "pointer" }}>
                  อัปโหลดรูป
                  <input type="file" accept="image/*" className="sr-only" />
                </label>
                <button type="button" className="btn btn--danger">
                  ลบรูป
                </button>
              </div>
            </div>

            <fieldset>
              <legend style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}>
                สีพื้นหลังรูปโปรไฟล์
              </legend>
              <div className="row" style={{ gap: 10 }}>
                {AVATAR_COLORS.map(([c, label]) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={label}
                    aria-pressed={c === color}
                    onClick={() => {
                      setColor(c);
                      setSaved(false);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: c,
                      border: `2px solid ${c === color ? "#FFFFFF" : "transparent"}`,
                      boxShadow: c === color ? "0 0 12px rgba(255,255,255,0.5)" : "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </fieldset>
          </section>

          {/* ---------- ข้อมูลพื้นฐาน ---------- */}
          <section aria-labelledby="sec-basic" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 id="sec-basic" style={{ fontSize: 18, fontWeight: 600 }}>
              ข้อมูลพื้นฐาน
            </h2>

            <div className="field">
              <label htmlFor="ep-name">ชื่อที่แสดง</label>
              <input
                id="ep-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="ep-username">ชื่อผู้ใช้</label>
              <div style={{ position: "relative" }}>
                <span aria-hidden="true" style={{ position: "absolute", left: 16, top: 11, color: "var(--text-muted)" }}>
                  @
                </span>
                <input
                  id="ep-username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    setSaved(false);
                  }}
                  style={{ paddingLeft: 34 }}
                />
              </div>
              <span className="field__hint" style={{ color: usernameOk ? "var(--ok-fg)" : "var(--warn-fg)" }}>
                {usernameOk ? "✓ ใช้ชื่อนี้ได้" : "ใช้ a-z, 0-9, _ และ . ความยาว 3–20 ตัว"}
              </span>
            </div>

            <div className="field">
              <label htmlFor="ep-bio">แนะนำตัว</label>
              <textarea
                id="ep-bio"
                maxLength={BIO_LIMIT}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSaved(false);
                }}
              />
              <span className="field__hint" style={{ textAlign: "right" }}>
                {bio.length} / {BIO_LIMIT}
              </span>
            </div>

            <div className="field">
              <label htmlFor="ep-email">อีเมล</label>
              <input id="ep-email" type="email" defaultValue="natchanon@example.com" readOnly />
              <span className="field__hint" style={{ color: "var(--ok-fg)" }}>
                ✓ ยืนยันแล้ว
              </span>
            </div>
          </section>

          {/* ---------- ประเภทเกมที่ชอบ ---------- */}
          <section aria-labelledby="sec-genre" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 id="sec-genre" style={{ fontSize: 18, fontWeight: 600 }}>
              ประเภทเกมที่ชอบ (เลือกได้สูงสุด {MAX_GENRES})
            </h2>
            <div className="row" style={{ gap: 8 }}>
              {ALL_GENRES.map((g) => {
                const on = genres.includes(g);
                const full = !on && genres.length >= MAX_GENRES;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    disabled={full}
                    onClick={() => toggleGenre(g)}
                    className={on ? "chip is-active" : "chip"}
                    style={full ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <span className="muted" style={{ fontSize: 13 }}>
              เลือกแล้ว {genres.length} / {MAX_GENRES}
            </span>
          </section>

          {/* ---------- ความเป็นส่วนตัว ---------- */}
          <section aria-labelledby="sec-privacy" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 id="sec-privacy" style={{ fontSize: 18, fontWeight: 600 }}>
              ความเป็นส่วนตัว
            </h2>
            {PRIVACY.map(([key, label, desc]) => (
              <Toggle
                key={key}
                label={label}
                desc={desc}
                checked={privacy[key]}
                onChange={(v) => {
                  setPrivacy((p) => ({ ...p, [key]: v }));
                  setSaved(false);
                }}
              />
            ))}
          </section>

          {/* ---------- เปลี่ยนรหัสผ่าน ---------- */}
          <section aria-labelledby="sec-pass" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 id="sec-pass" style={{ fontSize: 18, fontWeight: 600 }}>
              เปลี่ยนรหัสผ่าน
            </h2>

            <div className="field">
              <label htmlFor="ep-pw-current">รหัสผ่านปัจจุบัน</label>
              <input id="ep-pw-current" type="password" autoComplete="current-password" />
            </div>

            <div className="field">
              <label htmlFor="ep-pw-new">รหัสผ่านใหม่</label>
              <input
                id="ep-pw-new"
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setSaved(false);
                }}
              />
              <div className="row" style={{ gap: 12, flexWrap: "nowrap", marginTop: 4 }}>
                <span style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-input)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: strength[2], background: strength[1], transition: "width .2s" }} />
                </span>
                <span className="field__hint" style={{ whiteSpace: "nowrap" }}>
                  ความแข็งแรง: {strength[0]}
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="ep-pw-confirm">ยืนยันรหัสผ่านใหม่</label>
              <input
                id="ep-pw-confirm"
                type="password"
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => {
                  setPw2(e.target.value);
                  setSaved(false);
                }}
              />
              {pw2.length > 0 && (
                <span className="field__hint" style={{ color: mismatch ? "var(--danger-fg)" : "var(--ok-fg)" }}>
                  {mismatch ? "✗ รหัสผ่านใหม่ไม่ตรงกัน" : "✓ รหัสผ่านตรงกัน"}
                </span>
              )}
            </div>
          </section>

          <div className="row" style={{ gap: 12 }}>
            <button type="submit" className="btn btn--primary btn--lg" disabled={mismatch || !usernameOk}>
              บันทึกการเปลี่ยนแปลง
            </button>
            <Link to="/profile" className="btn btn--secondary btn--lg">
              ยกเลิก
            </Link>
          </div>
        </form>

        {/* ---------- ตัวอย่างโปรไฟล์ ---------- */}
        <aside
          aria-label="ตัวอย่างโปรไฟล์"
          className="card card--pad"
          style={{ flex: "1 1 280px", position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>ตัวอย่างโปรไฟล์</h2>
          <div className="row" style={{ gap: 14, flexWrap: "nowrap" }}>
            <span
              style={{
                width: 64,
                height: 64,
                flex: "none",
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-head)",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {initial}
            </span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <b>{name || "ยังไม่ได้ตั้งชื่อ"}</b>
              <span className="muted" style={{ fontSize: 14 }}>
                @{username}
              </span>
            </span>
          </div>
          <p className="dim" style={{ margin: 0, fontSize: 14 }}>
            {bio || "ยังไม่มีคำแนะนำตัว"}
          </p>
          <div className="row" style={{ gap: 6 }}>
            {genres.map((g) => (
              <span key={g} className="tag">
                {g}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
