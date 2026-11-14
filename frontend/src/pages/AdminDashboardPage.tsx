import { useMemo, useState } from "react";
import DashboardLayout, { Kpi, type SidebarItem } from "../components/DashboardLayout";
import { ChartIcon, GamepadIcon, ReceiptIcon, ShieldIcon, TagIcon, UsersIcon } from "../components/icons";

interface QueueItem {
  id: string;
  title: string;
  dev: string;
  genre: string;
  price: string;
  size: string;
  sent: string;
  color: string;
}

const QUEUE: QueueItem[] = [
  { id: "q1", title: "Temple Runner DX", dev: "Lotus Forge", genre: "แอ็กชัน", price: "฿179", size: "172 MB", sent: "9 พ.ย.", color: "#2E1A14" },
  { id: "q2", title: "Rain Garden", dev: "Sprout Studio", genre: "แคชวล", price: "฿89", size: "88 MB", sent: "9 พ.ย.", color: "#13261F" },
  { id: "q3", title: "Cyber Songkran", dev: "Volt Pixel", genre: "แข่งรถ", price: "฿259", size: "194 MB", sent: "8 พ.ย.", color: "#2A1240" },
  { id: "q4", title: "Quiet Lighthouse", dev: "River Lab", genre: "ปริศนา", price: "฿129", size: "45 MB", sent: "7 พ.ย.", color: "#0F2236" },
];

const DEV_REQUESTS = [
  { name: "Kinnaree Works", initial: "K", sent: "ส่งคำขอ 9 พ.ย. 2569" },
  { name: "Mango Byte", initial: "M", sent: "ส่งคำขอ 8 พ.ย. 2569" },
];

const CATEGORIES = [
  ["แอ็กชัน", 24],
  ["ผจญภัย", 19],
  ["RPG", 17],
  ["กลยุทธ์", 11],
  ["จำลอง", 15],
  ["ปริศนา", 13],
  ["แข่งรถ", 8],
  ["แคชวล", 19],
] as const;

const ADMIN_ORDERS = [
  { id: "#ORD-24117", buyer: "ณัฐชนน น.", items: "Echo of Siam", total: "฿459", status: "FULFILLED", ref: "pay_mock_8f2a…" },
  { id: "#ORD-24116", buyer: "mint.pp", items: "Lotus Knight", total: "฿299", status: "PAID", ref: "pay_mock_77c1…" },
  { id: "#ORD-24115", buyer: "ploy_s", items: "Pixel Krathong, Star Courier", total: "฿388", status: "PENDING", ref: "รอ webhook" },
  { id: "#ORD-24109", buyer: "tonkla_99", items: "Iron Monsoon", total: "฿399", status: "REFUNDED", ref: "pay_mock_19de…" },
  { id: "#ORD-24102", buyer: "beam.k", items: "Night Shift BKK", total: "฿229", status: "CANCELLED", ref: "—" },
];

const ORDER_TONE: Record<string, string> = {
  FULFILLED: "pill--ok",
  PAID: "pill--info",
  PENDING: "pill--warn",
  REFUNDED: "pill--danger",
  CANCELLED: "pill--danger",
};

type Decision = "ok" | "no";

export default function AdminDashboardPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [newCategory, setNewCategory] = useState("");

  const pendingCount = useMemo(
    () => QUEUE.filter((q) => !decisions[q.id]).length,
    [decisions]
  );

  const sidebar: SidebarItem[] = [
    { label: "ภาพรวม", icon: <ChartIcon />, target: "overview" },
    { label: "อนุมัติเกม", icon: <GamepadIcon />, target: "queue", badge: pendingCount },
    { label: "ผู้ใช้และผู้พัฒนา", icon: <UsersIcon />, target: "dev-requests" },
    { label: "คำสั่งซื้อและการชำระเงิน", icon: <ReceiptIcon />, target: "orders" },
    { label: "หมวดหมู่เกม", icon: <TagIcon />, target: "categories" },
    { label: "รายงานแพลตฟอร์ม", icon: <ShieldIcon />, target: "overview" },
  ];

  function decide(id: string, value: Decision | null) {
    setDecisions((prev) => {
      const next = { ...prev };
      if (value) next[id] = value;
      else delete next[id];
      return next;
    });
  }

  return (
    <DashboardLayout
      console="Admin Console"
      items={sidebar}
      activeIndex={0}
      account={
        <div className="panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            เข้าสู่ระบบในฐานะ
          </span>
          <span className="pill pill--info" style={{ alignSelf: "flex-start" }}>
            ADMIN
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            สิทธิ์ตรวจสอบโดย RBAC
          </span>
        </div>
      }
    >
      <div id="overview">
        <h1 className="page-title">ภาพรวมแพลตฟอร์ม</h1>
        <p className="muted" style={{ margin: 0 }}>
          ข้อมูล ณ วันที่ 10 พ.ย. 2569
        </p>
      </div>

      <div className="kpi-grid">
        <Kpi label="ผู้ใช้ทั้งหมด" value="3,482" delta="ผู้เล่น 3,391 · ผู้พัฒนา 87 · แอดมิน 4" deltaTone="var(--text-muted)" />
        <Kpi label="เกมรอตรวจสอบ" value={`${pendingCount} เกม`} delta="เกมที่เผยแพร่แล้ว 126 เกม" deltaTone="var(--text-muted)" />
        <Kpi label="คำสั่งซื้อวันนี้" value="148" delta="PENDING 6 · REFUNDED 2" deltaTone="var(--text-muted)" />
        <Kpi label="ยอดขายรวมเดือนนี้" value="฿1.24M" delta="▲ 8% จากเดือนก่อน" />
      </div>

      {/* ---------- คิวตรวจสอบเกม ---------- */}
      <section id="queue" className="stack" style={{ gap: 12 }}>
        <div>
          <h2 className="section-title">คิวตรวจสอบและอนุมัติเกม</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            ตรวจไฟล์ ขนาด (≤200 MB) เนื้อหา และราคา ก่อนเผยแพร่
          </p>
        </div>

        {QUEUE.map((q) => {
          const decision = decisions[q.id];
          return (
            <div key={q.id} className="card card--pad">
              <div className="row row--between" style={{ gap: 16 }}>
                <div className="row" style={{ gap: 14, flexWrap: "nowrap", minWidth: 0 }}>
                  <span
                    style={{
                      width: 72,
                      height: 48,
                      flex: "none",
                      borderRadius: 8,
                      background: q.color,
                    }}
                  />
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <b>{q.title}</b>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {q.dev} · {q.genre} · {q.price} · ไฟล์ {q.size} · ส่งเมื่อ {q.sent}
                    </span>
                  </span>
                </div>

                {decision ? (
                  <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                    <span className={`pill ${decision === "ok" ? "pill--ok" : "pill--danger"}`}>
                      {decision === "ok"
                        ? "✓ อนุมัติแล้ว · เผยแพร่บนร้านค้า"
                        : "✕ ปฏิเสธแล้ว · แจ้งผู้พัฒนา"}
                    </span>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => decide(q.id, null)}>
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                    <button type="button" className="btn btn--secondary btn--sm">
                      ดูไฟล์
                    </button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => decide(q.id, "no")}>
                      ปฏิเสธ
                    </button>
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => decide(q.id, "ok")}>
                      อนุมัติ
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        {/* ---------- คำขอเปิดบัญชีผู้พัฒนา ---------- */}
        <section id="dev-requests" className="card card--pad" style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>คำขอเปิดบัญชีผู้พัฒนา</h2>
          {DEV_REQUESTS.map((d) => (
            <div key={d.name} className="row row--between" style={{ gap: 12, flexWrap: "nowrap" }}>
              <span className="row" style={{ gap: 10, flexWrap: "nowrap", minWidth: 0 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: "50%",
                    background: "var(--surface-input)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                  }}
                >
                  {d.initial}
                </span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ fontSize: 15 }}>{d.name}</span>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {d.sent}
                  </span>
                </span>
              </span>
              <button type="button" className="btn btn--primary btn--sm">
                อนุมัติ
              </button>
            </div>
          ))}
          <a href="#users" style={{ fontSize: 14 }}>
            จัดการผู้ใช้ทั้งหมด →
          </a>
        </section>

        {/* ---------- หมวดหมู่เกม ---------- */}
        <section id="categories" className="card card--pad" style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>หมวดหมู่เกม</h2>
          <div className="row" style={{ gap: 8 }}>
            {CATEGORIES.map(([name, count]) => (
              <span key={name} className="tag" style={{ padding: "6px 12px", borderRadius: 999 }}>
                {name} · {count}
              </span>
            ))}
          </div>
          <form
            className="row"
            style={{ gap: 10, flexWrap: "nowrap" }}
            onSubmit={(e) => {
              e.preventDefault();
              setNewCategory("");
            }}
          >
            <label htmlFor="new-cat" className="sr-only">
              ชื่อหมวดหมู่ใหม่
            </label>
            <input
              id="new-cat"
              placeholder="ชื่อหมวดหมู่ใหม่"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">
              เพิ่ม
            </button>
          </form>
        </section>
      </div>

      {/* ---------- คำสั่งซื้อล่าสุด ---------- */}
      <section id="orders" className="stack" style={{ gap: 12 }}>
        <h2 className="section-title">คำสั่งซื้อล่าสุด</h2>
        <div className="table-wrap">
          <table style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th scope="col">คำสั่งซื้อ</th>
                <th scope="col">ผู้ซื้อ</th>
                <th scope="col">รายการ</th>
                <th scope="col" className="num">ยอดรวม</th>
                <th scope="col">สถานะ</th>
                <th scope="col">อ้างอิงการชำระเงิน</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td>{o.buyer}</td>
                  <td>{o.items}</td>
                  <td className="num">{o.total}</td>
                  <td>
                    <span className={`pill ${ORDER_TONE[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="mono muted">{o.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
