import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout, { Kpi, type SidebarItem } from "../components/DashboardLayout";
import { DEV_REQUESTS, GENRES, PLATFORM_ORDERS, PROFILE } from "../data/mock";
import { ChartIcon, GamepadIcon, ReceiptIcon, ShieldIcon, TagIcon, UsersIcon } from "../components/icons";
import { useShop } from "../store/shop";

const ORDER_TONE: Record<string, string> = {
  FULFILLED: "pill--ok",
  PAID: "pill--info",
  PENDING: "pill--warn",
  REFUNDED: "pill--danger",
  CANCELLED: "pill--danger",
};

const MAX_FILE_MB = 200;

export default function AdminDashboardPage() {
  const shop = useShop();
  const [newCategory, setNewCategory] = useState("");
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [lastDecision, setLastDecision] = useState<string | null>(null);

  const queue = shop.pendingGames;
  const approvedCount = shop.approvedGames.length;

  const categories = useMemo(() => {
    const base = GENRES.filter((g) => g !== "ทั้งหมด") as readonly string[];
    const counts: Record<string, number> = {};
    for (const g of shop.approvedGames) counts[g.genre] = (counts[g.genre] ?? 0) + 1;
    return [...base, ...extraCategories].map((name) => ({ name, count: counts[name] ?? 0 }));
  }, [shop.approvedGames, extraCategories]);

  /** คำสั่งซื้อของผู้ใช้ในเซสชันนี้ จะขึ้นบนสุดร่วมกับคำสั่งซื้อเดิมของแพลตฟอร์ม */
  const orders = useMemo(
    () => [
      ...shop.orders.map((o) => ({
        id: o.id,
        buyer: PROFILE.name,
        items: o.items,
        total: o.total,
        status: o.status,
        ref: `pay_mock_${o.id.replace(/\D/g, "").slice(-4)}…`,
      })),
      ...PLATFORM_ORDERS,
    ],
    [shop.orders]
  );

  const sidebar: SidebarItem[] = [
    { label: "ภาพรวม", icon: <ChartIcon />, target: "overview" },
    { label: "อนุมัติเกม", icon: <GamepadIcon />, target: "queue", badge: queue.length },
    { label: "ผู้ใช้และผู้พัฒนา", icon: <UsersIcon />, target: "dev-requests" },
    { label: "คำสั่งซื้อและการชำระเงิน", icon: <ReceiptIcon />, target: "orders" },
    { label: "หมวดหมู่เกม", icon: <TagIcon />, target: "categories" },
    { label: "รายงานแพลตฟอร์ม", icon: <ShieldIcon />, target: "overview" },
  ];

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
          ข้อมูลอัปเดตตามการใช้งานจริงในระบบ
        </p>
      </div>

      <div className="kpi-grid">
        <Kpi label="ผู้ใช้ทั้งหมด" value="3,482" delta="ผู้เล่น 3,391 · ผู้พัฒนา 87 · แอดมิน 4" deltaTone="var(--text-muted)" />
        <Kpi label="เกมรอตรวจสอบ" value={`${queue.length} เกม`} delta={`เกมที่เผยแพร่แล้ว ${approvedCount} เกม`} deltaTone="var(--text-muted)" />
        <Kpi label="คำสั่งซื้อในระบบ" value={String(orders.length)} delta={`ในเซสชันนี้ ${shop.orders.length} รายการ`} deltaTone="var(--text-muted)" />
        <Kpi label="คำขอเปิดบัญชีผู้พัฒนา" value={`${DEV_REQUESTS.length} ราย`} delta="รอการอนุมัติ" deltaTone="var(--text-muted)" />
      </div>

      {/* ---------- คิวตรวจสอบเกม ---------- */}
      <section id="queue" className="stack" style={{ gap: 12 }}>
        <div>
          <h2 className="section-title">คิวตรวจสอบและอนุมัติเกม</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            ตรวจไฟล์ ขนาด (≤{MAX_FILE_MB} MB) เนื้อหา และราคา ก่อนเผยแพร่
          </p>
        </div>

        {lastDecision && (
          <div role="status" className="alert alert--ok">
            <span>{lastDecision}</span>
          </div>
        )}

        {queue.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            ไม่มีเกมรอตรวจสอบในขณะนี้
          </p>
        ) : (
          queue.map((q) => (
            <div key={q.id} className="card card--pad">
              <div className="row row--between" style={{ gap: 16 }}>
                <div className="row" style={{ gap: 14, flexWrap: "nowrap", minWidth: 0 }}>
                  <span
                    style={{ width: 72, height: 48, flex: "none", borderRadius: 8, background: q.color, overflow: "hidden" }}
                  >
                    {q.coverUrl && (
                      <img src={q.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <b>{q.title}</b>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {q.dev} · {q.genre} · ฿{q.price} · {q.sizeMB > 0 ? `ไฟล์ ${q.sizeMB} MB` : "ยังไม่มีไฟล์"} · ส่งเมื่อ {q.submittedAt}
                    </span>
                    {q.sizeMB > MAX_FILE_MB && (
                      <span style={{ fontSize: 13, color: "var(--danger-fg)" }}>
                        ⚠ ไฟล์เกินขนาดที่กำหนด
                      </span>
                    )}
                    {q.sizeMB === 0 && (
                      <span style={{ fontSize: 13, color: "var(--warn-fg)" }}>
                        ⚠ ผู้พัฒนายังไม่ได้อัปโหลดไฟล์เกม — ผู้ซื้อจะดาวน์โหลดไม่ได้
                      </span>
                    )}
                    <span className="muted" style={{ fontSize: 13 }}>
                      {q.screenshots.length} ภาพหน้าจอ · {q.videoUrl ? "มีคลิปวิดีโอ" : "ไม่มีคลิป"}
                    </span>
                  </span>
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                  <button type="button" className="btn btn--secondary btn--sm" disabled={q.sizeMB === 0}>
                    ดูไฟล์
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => {
                      shop.rejectGame(q.id);
                      setLastDecision(`ปฏิเสธ “${q.title}” แล้ว · แจ้งผู้พัฒนาเรียบร้อย`);
                    }}
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      shop.approveGame(q.id);
                      setLastDecision(`อนุมัติ “${q.title}” แล้ว · เผยแพร่บนหน้าร้านค้าเรียบร้อย`);
                    }}
                  >
                    อนุมัติ
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
        </section>

        {/* ---------- หมวดหมู่เกม ---------- */}
        <section id="categories" className="card card--pad" style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>หมวดหมู่เกม</h2>
          <div className="row" style={{ gap: 8 }}>
            {categories.map((c) => (
              <span key={c.name} className="tag" style={{ padding: "6px 12px", borderRadius: 999 }}>
                {c.name} · {c.count}
              </span>
            ))}
          </div>
          <form
            className="row"
            style={{ gap: 10, flexWrap: "nowrap" }}
            onSubmit={(e) => {
              e.preventDefault();
              const name = newCategory.trim();
              if (name && !categories.some((c) => c.name === name)) {
                setExtraCategories((prev) => [...prev, name]);
              }
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
              {orders.map((o) => (
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
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          ดูเกมที่เผยแพร่แล้วทั้งหมดได้ที่ <Link to="/">หน้าร้านค้า</Link>
        </p>
      </section>
    </DashboardLayout>
  );
}
