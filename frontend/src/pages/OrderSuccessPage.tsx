import { Link, useLocation } from "react-router-dom";
import OrderSteps, { GameThumb, maskKey } from "../components/OrderSteps";
import { ORDER_STATUS, PROFILE } from "../data/mock";
import { useShop } from "../store/shop";

/** ขั้นที่ 3 — ชำระเงินสำเร็จ (เปิดได้เฉพาะหลังชำระเงินจริงในเซสชันนี้) */
export default function OrderSuccessPage() {
  const shop = useShop();
  const location = useLocation();
  const state = location.state as { orderId?: string; email?: string } | null;

  const order = shop.orders.find((o) => o.id === state?.orderId);
  const bought = shop.library
    .filter((e) => e.orderId === state?.orderId)
    .map((entry) => ({ entry, game: shop.games.find((g) => g.id === entry.gameId) }))
    .filter((x): x is { entry: typeof x.entry; game: NonNullable<typeof x.game> } => !!x.game);
  const total = bought.reduce((sum, x) => sum + x.entry.pricePaid, 0);

  if (!order) {
    return (
      <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>ไม่พบคำสั่งซื้อ</h1>
        <p className="dim" style={{ margin: 0 }}>
          หน้านี้จะแสดงหลังชำระเงินสำเร็จเท่านั้น ดูประวัติคำสั่งซื้อทั้งหมดได้ที่คลังเกม
        </p>
        <div className="row" style={{ gap: 12 }}>
          <Link to="/" className="btn btn--secondary">
            กลับไปหน้าร้านค้า
          </Link>
          <Link to="/library" className="btn btn--primary">
            ไปที่คลังเกม
          </Link>
        </div>
      </div>
    );
  }

  const status = ORDER_STATUS[order.status];

  return (
    <>
      <OrderSteps current={3} />

      <section className="card success-card" aria-labelledby="ok-title">
        <span className="success-badge" aria-hidden="true">
          ✓
        </span>
        <h1 id="ok-title" style={{ fontFamily: "var(--font-head)", fontSize: 36, fontWeight: 700 }}>
          ชำระเงินสำเร็จ!
        </h1>

        <div className="row" style={{ gap: 12, justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 16 }}>
            คำสั่งซื้อ {order.id}
          </span>
          <span className={`pill ${status.tone}`}>{status.label}</span>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          ส่งใบเสร็จไปที่ {state?.email || PROFILE.email} แล้ว
        </p>

        <ul aria-label="เกมที่ซื้อ" style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          {bought.map(({ entry, game }) => (
            <li key={entry.gameId} className="bought-row">
              <GameThumb game={game} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{game.title}</span>
                <span className="mono muted" style={{ fontSize: 13 }}>
                  License Key: {maskKey(entry.licenseKey)}
                </span>
              </span>
              <span style={{ fontWeight: 600, flex: "none" }}>฿{entry.pricePaid.toLocaleString()}</span>
            </li>
          ))}
        </ul>

        <div className="row row--between" style={{ width: "100%", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600 }}>ชำระแล้วทั้งหมด</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600, color: "var(--gold)" }}>
            ฿{total.toLocaleString()}
          </span>
        </div>

        <div className="row" style={{ width: "100%", gap: 12, flexWrap: "nowrap" }}>
          <Link to="/" className="btn btn--secondary btn--lg" style={{ flex: 1, borderColor: "rgba(255,255,255,.35)" }}>
            กลับไปหน้าร้านค้า
          </Link>
          <Link to="/library" className="btn btn--primary btn--lg" style={{ flex: 1 }}>
            ไปที่คลังเกม
          </Link>
        </div>

        <p className="summary__note">
          License Key เต็มดูได้ในคลังเกม · สร้างคำสั่งซื้อ · รายการ · สิทธิ์ในคลังเกม ภายใน $transaction เดียว
          (ล้มเหลวขั้นใดยกเลิกทั้งหมด)
        </p>
      </section>
    </>
  );
}
