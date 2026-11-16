import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import DashboardLayout, { Kpi, type SidebarItem } from "../components/DashboardLayout";
import { CURRENT_DEV, type Game } from "../data/mock";
import GameEditor from "../components/GameEditor";
import {
  ChartIcon,
  GamepadIcon,
  ReceiptIcon,
  StarIcon,
  UploadIcon,
  UsersIcon,
} from "../components/icons";
import { useShop } from "../store/shop";

const SIDEBAR: SidebarItem[] = [
  { label: "ภาพรวม", icon: <ChartIcon />, target: "overview" },
  { label: "รายงานยอดขาย", icon: <ReceiptIcon />, target: "sales" },
  { label: "เกมของฉัน", icon: <GamepadIcon />, target: "my-games" },
  { label: "อัปโหลดเกม", icon: <UploadIcon />, target: "upload" },
  { label: "รีวิวจากผู้เล่น", icon: <StarIcon />, target: "reviews", soon: true },
  { label: "บัญชีผู้พัฒนา", icon: <UsersIcon />, target: "account" },
];

const STATUS_LABEL = {
  APPROVED: { text: "✓ อนุมัติแล้ว", tone: "pill--ok" },
  PENDING: { text: "◷ รอตรวจสอบ", tone: "pill--warn" },
  REJECTED: { text: "✕ ถูกปฏิเสธ", tone: "pill--danger" },
};

const RANGES = [
  { n: 7, label: "7 วัน" },
  { n: 14, label: "14 วัน" },
  { n: 30, label: "30 วัน" },
];

const MAX_FILE_MB = 200;

export default function DevDashboardPage() {
  const shop = useShop();
  const [range, setRange] = useState(14);

  /* ฟอร์มอัปโหลดเกม */
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [genre, setGenre] = useState("RPG");
  const [description, setDescription] = useState("");
  const [sizeMB, setSizeMB] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<Game | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const myGames = shop.gamesByDev(CURRENT_DEV);
  const suspended = shop.isSuspended(CURRENT_DEV);
  const approved = myGames.filter((g) => g.status === "APPROVED");
  const pending = myGames.filter((g) => g.status === "PENDING");
  const rejected = myGames.filter((g) => g.status === "REJECTED");


  const unitsSold = approved.reduce((sum, g) => sum + g.unitsSold, 0);
  const revenue = approved.reduce((sum, g) => sum + g.unitsSold * g.price, 0);
  const withFile = myGames.filter((g) => g.sizeMB > 0).length;

  const { bars, total, top } = useMemo(() => {
    const all: number[] = [];
    for (let i = 0; i < 30; i++) {
      all.push(Math.round(4 + i * 0.55 + 5 * Math.abs(Math.sin(i * 1.7))));
    }
    const data = all.slice(30 - range);
    const max = Math.max(...data);
    const topValue = Math.ceil(max / 10) * 10;
    return {
      bars: data.map((v, i) => ({
        height: `${Math.round((v / topValue) * 100)}%`,
        color: i === data.length - 1 ? "var(--accent)" : "#6EA8FF",
        value: v,
      })),
      total: data.reduce((a, b) => a + b, 0),
      top: topValue,
    };
  }, [range]);

  function handleSubmitGame(e: FormEvent) {
    e.preventDefault();
    setSubmitted(null);

    const priceNum = Number(price);
    const sizeNum = sizeMB.trim() === "" ? 0 : Number(sizeMB);

    if (!title.trim()) return setFormError("กรุณากรอกชื่อเกม");
    if (!description.trim()) return setFormError("กรุณากรอกคำอธิบายเกม");
    if (!Number.isFinite(priceNum) || priceNum < 0) return setFormError("ราคาต้องเป็นตัวเลขไม่ติดลบ");
    if (!Number.isFinite(sizeNum) || sizeNum < 0) return setFormError("ขนาดไฟล์ไม่ถูกต้อง");
    if (sizeNum > MAX_FILE_MB) return setFormError(`ไฟล์เกมต้องไม่เกิน ${MAX_FILE_MB} MB`);
    if (suspended) return setFormError("บัญชีถูกระงับ ไม่สามารถส่งเกมใหม่ได้");

    // TODO: ต่อกับ POST /api/games (multipart พร้อมไฟล์เกมจริง)
    const game = shop.submitGame(
      { title, price: priceNum, genre, description, sizeMB: sizeNum, coverUrl },
      CURRENT_DEV
    );
    setFormError(null);
    setSubmitted(game.title);
    setTitle("");
    setPrice("");
    setDescription("");
    setSizeMB("");
    setCoverUrl(null);
  }

  return (
    <DashboardLayout
      console="Developer Console"
      items={SIDEBAR}
      activeIndex={0}
      account={
        <div className="panel" id="account" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className={suspended ? "pill pill--danger" : "pill pill--ok"} style={{ alignSelf: "flex-start" }}>
            {suspended ? "บัญชีถูกระงับ" : "อนุมัติแล้ว"}
          </span>
          <span style={{ fontSize: 14 }}>{CURRENT_DEV}</span>
          <span className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>
            dev@lotusforge.example
          </span>
        </div>
      }
    >
      <div className="row row--between" id="overview">
        <div>
          <h1 className="page-title">สวัสดี, {CURRENT_DEV}</h1>
          <p className="muted" style={{ margin: 0 }}>
            เกมที่เผยแพร่แล้ว {approved.length} เกม · รอตรวจสอบ {pending.length} เกม
          </p>
        </div>
        <a href="#upload" className="btn btn--primary">
          <UploadIcon size={18} />
          อัปโหลดเกมใหม่
        </a>
      </div>

      {suspended && (
        <div role="alert" className="alert alert--danger">
          <span>
            <b>บัญชีผู้พัฒนานี้ถูกผู้ดูแลระบบระงับ</b> — เกมทั้งหมดถูกซ่อนจากหน้าร้านค้าชั่วคราว และส่งเกมใหม่ไม่ได้
            จนกว่าจะยกเลิกการระงับ
          </span>
        </div>
      )}

      <div className="kpi-grid">
        <Kpi label="รายได้สะสม" value={`฿${revenue.toLocaleString()}`} delta="คิดจากยอดขายจริงของเกมที่อนุมัติแล้ว" deltaTone="var(--text-muted)" />
        <Kpi label="จำนวนที่ขายได้" value={`${unitsSold.toLocaleString()} ชุด`} delta={`จาก ${approved.length} เกม`} deltaTone="var(--text-muted)" />
        <Kpi label="เกมที่เผยแพร่" value={`${approved.length} เกม`} delta={`รอตรวจสอบ ${pending.length} · ถูกปฏิเสธ ${rejected.length}`} deltaTone="var(--text-muted)" />
        <Kpi
          label="เกมที่มีไฟล์พร้อมขาย"
          value={`${withFile}/${myGames.length} เกม`}
          delta={withFile === myGames.length ? "ทุกเกมมีไฟล์แล้ว" : `ยังไม่มีไฟล์ ${myGames.length - withFile} เกม`}
          deltaTone={withFile === myGames.length ? "var(--ok-fg)" : "var(--warn-fg)"}
        />
      </div>

      {/* ---------- กราฟยอดขาย ---------- */}
      <section id="sales" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="row row--between">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>ยอดขายรายวัน (ชุด)</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              รวม {total} ชุด ใน {range} วันล่าสุด
            </p>
          </div>
          <div className="tabs">
            {RANGES.map((r) => (
              <button
                key={r.n}
                type="button"
                aria-pressed={r.n === range}
                className={r.n === range ? "tab is-active" : "tab"}
                onClick={() => setRange(r.n)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div
            className="muted"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 12, height: 200 }}
          >
            <span>{top}</span>
            <span>{top / 2}</span>
            <span>0</span>
          </div>
          <div
            role="img"
            aria-label={`กราฟแท่งยอดขายรายวัน ${range} วันล่าสุด รวม ${total} ชุด`}
            style={{
              flex: 1,
              height: 200,
              display: "flex",
              alignItems: "flex-end",
              gap: range > 20 ? 3 : 6,
              borderBottom: "1px solid var(--border-soft)",
              borderLeft: "1px solid var(--border-soft)",
              paddingLeft: 8,
            }}
          >
            {bars.map((b, i) => (
              <span
                key={i}
                title={`${b.value} ชุด`}
                style={{ flex: 1, height: b.height, minHeight: 2, background: b.color, borderRadius: "3px 3px 0 0" }}
              />
            ))}
          </div>
        </div>
        <div className="row row--between muted" style={{ fontSize: 12, paddingLeft: 34 }}>
          <span>{range} วันก่อน</span>
          <span>วันนี้</span>
        </div>
      </section>

      {/* ---------- เกมของฉัน ---------- */}
      <section id="my-games" className="stack" style={{ gap: 12 }}>
        <h2 className="section-title">เกมของฉัน</h2>
        {myGames.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            ยังไม่มีเกม — อัปโหลดเกมแรกของคุณได้ที่ฟอร์มด้านล่าง
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">เกม</th>
                  <th scope="col" className="num">ราคา</th>
                  <th scope="col" className="num">ขายได้</th>
                  <th scope="col" className="num">รายได้</th>
                  <th scope="col">สถานะการอนุมัติ</th>
                  <th scope="col">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {myGames.map((g) => (
                  <tr key={g.id}>
                    <td>
                      {g.status === "APPROVED" ? (
                        <Link to={`/games/${g.slug}`} style={{ color: "var(--text)", fontWeight: 700, textDecoration: "none" }}>
                          {g.title}
                        </Link>
                      ) : (
                        <b>{g.title}</b>
                      )}
                      {g.rejectNote && (
                        <div className="muted" style={{ fontSize: 13 }}>
                          เหตุผล: {g.rejectNote}
                        </div>
                      )}
                      {g.sizeMB === 0 && (
                        <div style={{ fontSize: 13, color: "var(--warn-fg)" }}>
                          ⚠ ยังไม่มีไฟล์เกม
                        </div>
                      )}
                    </td>
                    <td className="num">฿{g.price}</td>
                    <td className="num">{g.status === "APPROVED" ? g.unitsSold : "—"}</td>
                    <td className="num">
                      {g.status === "APPROVED" ? `฿${(g.unitsSold * g.price).toLocaleString()}` : "—"}
                    </td>
                    <td>
                      <span className={`pill ${STATUS_LABEL[g.status].tone}`}>{STATUS_LABEL[g.status].text}</span>
                    </td>
                    <td>
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing(g)}>
                        {g.status === "REJECTED" ? "แก้ไขและส่งใหม่" : "แก้ไข"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        {/* ---------- อัปโหลดเกมใหม่ ---------- */}
        <section
          id="upload"
          className="card card--pad"
          style={{ flex: "999 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>อัปโหลดเกมใหม่</h2>

          {submitted && (
            <div role="status" className="alert alert--ok">
              <span>
                ส่ง <b>{submitted}</b> ให้ผู้ดูแลระบบตรวจสอบแล้ว — ดูสถานะได้ที่ตาราง “เกมของฉัน”
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitGame}>
            <div className="row" style={{ gap: 12 }}>
              <div className="field" style={{ flex: "2 1 200px" }}>
                <label htmlFor="up-title">ชื่อเกม</label>
                <input id="up-title" value={title} onChange={(e) => { setTitle(e.target.value); setFormError(null); }} />
              </div>
              <div className="field" style={{ flex: "1 1 120px" }}>
                <label htmlFor="up-price">ราคา (บาท)</label>
                <input id="up-price" type="number" min={0} value={price} onChange={(e) => { setPrice(e.target.value); setFormError(null); }} />
              </div>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label htmlFor="up-genre">ประเภท</label>
                <select id="up-genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
                  {shop.categories.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="up-desc">คำอธิบาย</label>
              <textarea
                id="up-desc"
                rows={3}
                value={description}
                onChange={(e) => { setDescription(e.target.value); setFormError(null); }}
              />
            </div>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 28,
                borderRadius: 12,
                border: "1px dashed var(--border-strong)",
                background: "var(--surface-input)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <UploadIcon size={28} />
              <b>ลากไฟล์เกม (.zip) มาวาง หรือคลิกเพื่อเลือก</b>
              <span className="muted" style={{ fontSize: 13 }}>
                ขนาดไม่เกิน {MAX_FILE_MB} MB · ยังไม่มีไฟล์ก็ส่งได้ ค่อยเพิ่มทีหลังจากปุ่มแก้ไข
              </span>
              <input
                type="file"
                accept=".zip"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSizeMB(String(Math.max(1, Math.round(f.size / (1024 * 1024)))));
                  setFormError(null);
                }}
              />
            </label>

            <div className="field">
              <label htmlFor="up-cover">รูปปกเกม</label>
              <div className="row" style={{ gap: 14 }}>
                <span
                  style={{
                    width: 128,
                    height: 80,
                    flex: "none",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "var(--surface-input)",
                    border: "1px dashed var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="ตัวอย่างรูปปกที่เลือก"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>
                      ยังไม่มีรูป
                    </span>
                  )}
                </span>
                <div className="field" style={{ flex: 1, minWidth: 180 }}>
                  <input
                    id="up-cover"
                    type="file"
                    accept="image/*"
                    style={{ paddingTop: 11 }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setCoverUrl(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                  <span className="field__hint">
                    แนะนำอัตราส่วน 16:10 · ถ้าไม่ใส่ ระบบจะใช้ภาพปกจำลองให้ก่อน
                  </span>
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="up-size">ขนาดไฟล์เกม (MB)</label>
              <input
                id="up-size"
                type="number"
                min={1}
                max={MAX_FILE_MB}
                value={sizeMB}
                onChange={(e) => { setSizeMB(e.target.value); setFormError(null); }}
              />
              <span className="field__hint">เว้นว่างได้ถ้ายังไม่มีไฟล์เกม</span>
            </div>

            {formError && (
              <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
                {formError}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--lg" disabled={suspended}>
              ส่งให้ผู้ดูแลระบบตรวจสอบ
            </button>
          </form>

          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            หลังส่ง เกมจะอยู่ในสถานะ “รอตรวจสอบ” จนกว่าผู้ดูแลระบบจะอนุมัติ จึงจะขึ้นหน้าร้านค้า
          </p>
        </section>

        {/* ---------- รีวิวจากผู้เล่น — ยังไม่เปิดใช้ในขอบเขต 30% ---------- */}
        <section
          id="reviews"
          className="card card--pad"
          style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            รีวิวจากผู้เล่น <span className="soon-badge">เร็ว ๆ นี้</span>
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            การดูและตอบกลับรีวิวจะเปิดใช้พร้อมระบบรีวิวในเวอร์ชันถัดไป
          </p>
        </section>
      </div>

      {editing && <GameEditor game={editing} onClose={() => setEditing(null)} />}
    </DashboardLayout>
  );
}
