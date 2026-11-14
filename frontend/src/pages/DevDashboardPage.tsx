import { useMemo, useState } from "react";
import DashboardLayout, { Kpi, type SidebarItem } from "../components/DashboardLayout";
import {
  ChartIcon,
  GamepadIcon,
  ReceiptIcon,
  StarIcon,
  UploadIcon,
  UsersIcon,
} from "../components/icons";

const SIDEBAR: SidebarItem[] = [
  { label: "ภาพรวม", icon: <ChartIcon />, target: "overview" },
  { label: "รายงานยอดขาย", icon: <ReceiptIcon />, target: "sales" },
  { label: "เกมของฉัน", icon: <GamepadIcon />, target: "my-games" },
  { label: "อัปโหลดเกม", icon: <UploadIcon />, target: "upload" },
  { label: "รีวิวจากผู้เล่น", icon: <StarIcon />, target: "reviews" },
  { label: "บัญชีผู้พัฒนา", icon: <UsersIcon />, target: "account" },
];

const MY_GAMES = [
  { title: "Echo of Siam", price: "฿459", sold: "162", revenue: "฿74,358", status: "approved" as const },
  { title: "Lotus Knight", price: "฿299", sold: "52", revenue: "฿15,548", status: "approved" as const },
  { title: "Temple Runner DX", price: "฿179", sold: "—", revenue: "—", status: "pending" as const },
  { title: "Bell Tower Demo", price: "฿0", sold: "—", revenue: "—", status: "rejected" as const, note: "เหตุผล: ไฟล์เกิน 200 MB" },
];

const STATUS_LABEL = {
  approved: { text: "✓ อนุมัติแล้ว", tone: "pill--ok" },
  pending: { text: "◷ รอตรวจสอบ", tone: "pill--warn" },
  rejected: { text: "✕ ถูกปฏิเสธ", tone: "pill--danger" },
};

const PENDING_REVIEWS = [
  { who: "tonkla_99 · Echo of Siam", stars: 4, text: "ช่วงกลางเกมต้องเก็บเลเวลนานไปหน่อย" },
  { who: "mint.pp · Lotus Knight", stars: 3, text: "บอสด่าน 3 ยากเกินไป อยากให้มีระดับความยากให้เลือก" },
  { who: "ploy_s · Echo of Siam", stars: 5, text: "ชอบเพลงประกอบมาก จะมี soundtrack ขายไหม" },
];

const RANGES = [
  { n: 7, label: "7 วัน" },
  { n: 14, label: "14 วัน" },
  { n: 30, label: "30 วัน" },
];

export default function DevDashboardPage() {
  const [range, setRange] = useState(14);

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

  return (
    <DashboardLayout
      console="Developer Console"
      items={SIDEBAR}
      activeIndex={0}
      account={
        <div className="panel" id="account" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="pill pill--ok" style={{ alignSelf: "flex-start" }}>
            อนุมัติแล้ว
          </span>
          <span style={{ fontSize: 14 }}>Lotus Forge</span>
          <span className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>
            dev@lotusforge.example
          </span>
        </div>
      }
    >
      <div className="row row--between" id="overview">
        <div>
          <h1 className="page-title">สวัสดี, Lotus Forge</h1>
          <p className="muted" style={{ margin: 0 }}>
            อัปเดตแบบเรียลไทม์ · ล่าสุด 13:56 น.
          </p>
        </div>
        <button type="button" className="btn btn--primary">
          <UploadIcon size={18} />
          อัปโหลดเกมใหม่
        </button>
      </div>

      <div className="kpi-grid">
        <Kpi label="รายได้เดือนนี้" value="฿84,230" delta="▲ 12% จากเดือนก่อน" />
        <Kpi label="จำนวนที่ขายได้" value="214 ชุด" delta="▲ 31 ชุด ในสัปดาห์นี้" />
        <Kpi label="เกมที่เผยแพร่" value="2 เกม" delta="รอตรวจสอบ 1 · ถูกปฏิเสธ 1" deltaTone="var(--text-muted)" />
        <Kpi label="คะแนนรีวิวเฉลี่ย" value="★ 4.6" delta="รอการตอบกลับ 3 รีวิว" deltaTone="var(--text-muted)" />
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
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontSize: 12,
              height: 200,
            }}
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
                style={{
                  flex: 1,
                  height: b.height,
                  minHeight: 2,
                  background: b.color,
                  borderRadius: "3px 3px 0 0",
                }}
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
              {MY_GAMES.map((g) => (
                <tr key={g.title}>
                  <td>
                    <b>{g.title}</b>
                    {g.note && (
                      <div className="muted" style={{ fontSize: 13 }}>
                        {g.note}
                      </div>
                    )}
                  </td>
                  <td className="num">{g.price}</td>
                  <td className="num">{g.sold}</td>
                  <td className="num">{g.revenue}</td>
                  <td>
                    <span className={`pill ${STATUS_LABEL[g.status].tone}`}>{STATUS_LABEL[g.status].text}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn--secondary btn--sm">
                      {g.status === "rejected" ? "ส่งใหม่" : "แก้ไข"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        {/* ---------- อัปโหลดเกมใหม่ ---------- */}
        <section
          id="upload"
          className="card card--pad"
          style={{ flex: "999 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>อัปโหลดเกมใหม่</h2>

          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: "2 1 200px" }}>
              <label htmlFor="up-title">ชื่อเกม</label>
              <input id="up-title" />
            </div>
            <div className="field" style={{ flex: "1 1 120px" }}>
              <label htmlFor="up-price">ราคา (บาท)</label>
              <input id="up-price" type="number" min={0} />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="up-genre">ประเภท</label>
              <select id="up-genre">
                <option>RPG</option>
                <option>แอ็กชัน</option>
                <option>ผจญภัย</option>
                <option>ปริศนา</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="up-desc">คำอธิบาย</label>
            <textarea id="up-desc" rows={3} />
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
              ขนาดไม่เกิน 200 MB · จัดเก็บแบบส่วนตัวบน AWS S3
            </span>
            <input type="file" accept=".zip" className="sr-only" />
          </label>

          <div className="field">
            <label htmlFor="up-shots">ภาพหน้าจอ (สูงสุด 5 ภาพ)</label>
            <input id="up-shots" type="file" accept="image/*" multiple style={{ paddingTop: 11 }} />
          </div>

          <button type="button" className="btn btn--primary btn--lg">
            ส่งให้ผู้ดูแลระบบตรวจสอบ
          </button>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            หลังส่ง เกมจะอยู่ในสถานะ “รอตรวจสอบ” จนกว่าผู้ดูแลระบบจะอนุมัติ
          </p>
        </section>

        {/* ---------- รีวิวที่รอการตอบกลับ ---------- */}
        <section
          id="reviews"
          className="card card--pad"
          style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>รีวิวที่รอการตอบกลับ</h2>
          {PENDING_REVIEWS.map((r) => (
            <div
              key={r.who}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 14,
                borderRadius: 10,
                background: "var(--surface-input)",
              }}
            >
              <div className="row row--between">
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.who}</span>
                <span className="star" style={{ fontSize: 14 }}>
                  {"★".repeat(r.stars)}
                  <span style={{ color: "#3A4150" }}>{"★".repeat(5 - r.stars)}</span>
                </span>
              </div>
              <p className="dim" style={{ margin: 0, fontSize: 14 }}>
                {r.text}
              </p>
              <button type="button" className="btn btn--secondary btn--sm" style={{ alignSelf: "flex-start" }}>
                ตอบกลับ
              </button>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
