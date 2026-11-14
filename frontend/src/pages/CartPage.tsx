import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CoverArt } from "../components/GameCard";
import { LockIcon } from "../components/icons";
import { useShop } from "../store/shop";

export default function CartPage() {
  const shop = useShop();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const items = shop.games.filter((g) => shop.has(g.id));
  const total = items.reduce((sum, g) => sum + g.price, 0);

  async function handleCheckout() {
    setPaying(true);
    // TODO: ต่อกับ POST /api/orders/checkout
    await new Promise((r) => setTimeout(r, 600));
    const order = shop.checkout();
    // ส่งผลการชำระเงินไปให้หน้าคลังเกม เพื่อให้แบนเนอร์ขึ้นเฉพาะตอนจ่ายเงินสำเร็จ
    navigate("/library", { state: { paid: order }, replace: true });
  }

  return (
    <>
      <nav aria-label="เส้นทาง" className="muted" style={{ fontSize: 14 }}>
        <Link to="/" style={{ color: "var(--text-muted)" }}>
          ร้านค้า
        </Link>
        {" / "}
        <span style={{ color: "var(--text)" }}>ตะกร้าสินค้า</span>
      </nav>

      <div>
        <h1 className="page-title">ตะกร้าสินค้า</h1>
        <p className="muted" style={{ margin: 0 }}>
          {items.length === 0 ? "ยังไม่มีเกมในตะกร้า" : `${items.length} เกมในตะกร้า`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <p className="dim" style={{ margin: 0 }}>
            ลองเลือกเกมจากหน้าร้านค้าก่อนนะครับ
          </p>
          <Link to="/" className="btn btn--primary">
            ไปหน้าร้านค้า
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          <ul
            aria-label="รายการในตะกร้า"
            className="card"
            style={{
              flex: "999 1 480px",
              minWidth: 0,
              listStyle: "none",
              margin: 0,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {items.map((g) => (
              <li key={g.id} className="row" style={{ gap: 14, flexWrap: "nowrap", padding: 10 }}>
                <Link
                  to={`/games/${g.slug}`}
                  style={{
                    width: 96,
                    height: 60,
                    flex: "none",
                    borderRadius: 8,
                    position: "relative",
                    overflow: "hidden",
                    background: g.color,
                  }}
                  aria-label={`ดูรายละเอียด ${g.title}`}
                >
                  <CoverArt color={g.color} accent={g.accent} />
                </Link>

                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <Link to={`/games/${g.slug}`} style={{ color: "var(--text)", fontWeight: 600, textDecoration: "none" }}>
                    {g.title}
                  </Link>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {g.dev} · {g.genre}
                  </span>
                </span>

                <span className="price" style={{ flex: "none" }}>
                  ฿{g.price}
                </span>

                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => shop.remove(g.id)}
                  style={{ flex: "none" }}
                >
                  นำออก
                </button>
              </li>
            ))}
          </ul>

          <aside
            className="card card--pad"
            style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 100 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>สรุปคำสั่งซื้อ</h2>

            <div className="row row--between" style={{ fontSize: 15 }}>
              <span className="muted">ราคาเกม ({items.length} รายการ)</span>
              <span>฿{total.toLocaleString()}</span>
            </div>
            <div className="row row--between" style={{ fontSize: 15 }}>
              <span className="muted">ส่วนลด</span>
              <span>฿0</span>
            </div>

            <div
              className="row row--between"
              style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}
            >
              <span style={{ fontWeight: 600 }}>ยอดรวมทั้งสิ้น</span>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600 }}>
                ฿{total.toLocaleString()}
              </span>
            </div>

            <button type="button" className="btn btn--primary btn--lg btn--block" onClick={handleCheckout} disabled={paying}>
              {paying ? "กำลังดำเนินการ…" : "ชำระเงิน"}
            </button>

            <p className="muted" style={{ margin: 0, fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ flex: "none", marginTop: 3, display: "flex" }}>
                <LockIcon />
              </span>
              ชำระเงินผ่านระบบจำลอง · ได้รับ License Key และเข้าคลังเกมทันทีหลังชำระเงิน
            </p>

            <Link to="/" className="btn btn--secondary btn--block">
              เลือกเกมเพิ่ม
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
