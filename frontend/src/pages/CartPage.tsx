import { Link, useNavigate } from "react-router-dom";
import OrderSteps, { GameThumb } from "../components/OrderSteps";
import { useShop } from "../store/shop";

/** ขั้นที่ 1 — ตะกร้าสินค้า */
export default function CartPage() {
  const shop = useShop();
  const navigate = useNavigate();

  /** เฉพาะเกมที่ยังขายอยู่ — ถ้าผู้ดูแลนำเกมออกจากร้าน เกมนั้นจะหายจากตะกร้า */
  const items = shop.approvedGames.filter((g) => shop.has(g.id) && !shop.owns(g.id));
  const total = items.reduce((sum, g) => sum + g.price, 0);

  return (
    <>
      <OrderSteps current={0} />

      <div className="row" style={{ alignItems: "baseline", gap: 14 }}>
        <h1 className="page-title">ตะกร้าสินค้า</h1>
        <span className="muted" style={{ fontSize: 16 }}>
          {items.length} รายการ
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <p className="dim" style={{ margin: 0 }}>
            ยังไม่มีเกมในตะกร้า ลองเลือกเกมจากหน้าร้านค้าก่อนนะครับ
          </p>
          <Link to="/" className="btn btn--primary">
            ไปหน้าร้านค้า
          </Link>
        </div>
      ) : (
        <div className="checkout">
          <div className="checkout__main">
            <ul aria-label="รายการในตะกร้า" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((g) => (
                <li key={g.id} className="card cart-item">
                  <Link to={`/games/${g.slug}`} aria-label={`ดูรายละเอียด ${g.title}`} style={{ flex: "none" }}>
                    <GameThumb game={g} />
                  </Link>

                  <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                    <Link to={`/games/${g.slug}`} style={{ color: "var(--text)", fontSize: 18, fontWeight: 600, textDecoration: "none" }}>
                      {g.title}
                    </Link>
                    <span className="muted" style={{ fontSize: 14 }}>
                      {g.dev} · {g.genre}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--ok-fg)" }}>ได้รับ License Key ทันทีหลังชำระเงิน</span>
                  </span>

                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: "none" }}>
                    <span style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 600 }}>
                      ฿{g.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="link-btn"
                      style={{ color: "#ff9a9a" }}
                      onClick={() => shop.remove(g.id)}
                      aria-label={`ลบ ${g.title} ออกจากตะกร้า`}
                    >
                      ลบออก
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <Link to="/" className="link-gold" style={{ alignSelf: "flex-start" }}>
              ← เลือกซื้อเกมต่อ
            </Link>
          </div>

          <aside className="card card--pad summary" aria-labelledby="sum-title">
            <h2 id="sum-title" style={{ fontSize: 20, fontWeight: 600 }}>
              สรุปคำสั่งซื้อ
            </h2>

            {items.map((g) => (
              <div key={g.id} className="summary__row">
                <span>{g.title}</span>
                <span>฿{g.price.toLocaleString()}</span>
              </div>
            ))}

            <div className="summary__divider" />

            <div className="summary__row">
              <span>ราคารวม ({items.length} เกม)</span>
              <span>฿{total.toLocaleString()}</span>
            </div>
            <div className="summary__row">
              <span>ส่วนลด</span>
              <span>฿0</span>
            </div>

            <div className="summary__divider" />

            <div className="row row--between" style={{ alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>ยอดชำระ</span>
              <span className="summary__total">฿{total.toLocaleString()}</span>
            </div>

            <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => navigate("/checkout")}>
              ดำเนินการชำระเงิน
            </button>

            <p className="summary__note">ราคาคำนวณใหม่ฝั่ง Server จากฐานข้อมูลทุกครั้ง · เชื่อมต่อผ่าน HTTPS</p>
          </aside>
        </div>
      )}
    </>
  );
}
