import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import OrderSteps from "../components/OrderSteps";
import { PROFILE } from "../data/mock";
import { useShop } from "../store/shop";

/**
 * ขั้นที่ 2 — ชำระเงิน (ระบบจำลอง)
 *
 * ข้อมูลบัตรอยู่แค่ใน state ของหน้านี้ ไม่ถูกส่ง ไม่ถูกบันทึก และไม่ถูกเขียนลง log
 * เลขบัตรทดสอบ: 4242… = สำเร็จ · 4000… = ถูกปฏิเสธ
 */

type Method = "card" | "promptpay";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** จัดรูปเลขบัตรเป็นกลุ่มละ 4 หลัก */
const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})(?=.)/g, "$1 ");

/** จัดรูปวันหมดอายุเป็น MM/YY */
const formatExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function expIsValid(exp: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

/** QR จำลอง — ลวดลายคงที่ ไม่ได้เข้ารหัสข้อมูลใด ๆ */
function MockQr() {
  const n = 21;
  const cells: ReactElement[] = [];
  const finder = (x: number, y: number) => x < 7 && y < 7;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const inFinder = finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);
      if (inFinder) continue;
      if (((x * 73856093) ^ (y * 19349663)) % 7 < 3) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="mock-qr" role="img" aria-label="QR พร้อมเพย์จำลอง (สแกนไม่ได้)" shapeRendering="crispEdges">
      <g fill="#0a1324">
        {cells}
        <Finder x={0} y={0} />
        <Finder x={n - 7} y={0} />
        <Finder x={0} y={n - 7} />
      </g>
    </svg>
  );
}

export default function CheckoutPage() {
  const shop = useShop();
  const navigate = useNavigate();

  /** เฉพาะเกมที่ยังขายอยู่ — ถ้าผู้ดูแลนำเกมออกจากร้าน เกมนั้นจะหายจากตะกร้า */
  const items = shop.approvedGames.filter((g) => shop.has(g.id) && !shop.owns(g.id));
  const total = items.reduce((sum, g) => sum + g.price, 0);
  const suspended = shop.isSuspended(PROFILE.name);

  const [name, setName] = useState(PROFILE.name);
  const [email, setEmail] = useState(PROFILE.email);
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<{ field: string; text: string } | null>(null);
  const [paying, setPaying] = useState(false);

  if (items.length === 0) {
    return (
      <>
        <OrderSteps current={1} />
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>ยังไม่มีเกมให้ชำระเงิน</h1>
          <p className="dim" style={{ margin: 0 }}>
            เพิ่มเกมลงตะกร้าก่อน แล้วค่อยกลับมาที่หน้านี้
          </p>
          <Link to="/" className="btn btn--primary">
            ไปหน้าร้านค้า
          </Link>
        </div>
      </>
    );
  }

  const fail = (field: string, text: string) => {
    setError({ field, text });
    return false;
  };

  function validate() {
    if (!name.trim()) return fail("name", "กรุณากรอกชื่อผู้ซื้อ");
    if (!EMAIL_RE.test(email.trim())) return fail("email", "อีเมลไม่ถูกต้อง");
    if (method === "card") {
      const digits = card.replace(/\D/g, "");
      if (digits.length !== 16) return fail("card", "กรุณากรอกเลขบัตรทดสอบให้ครบ 16 หลัก");
      if (!digits.startsWith("4242") && !digits.startsWith("4000"))
        return fail("card", "ระบบจำลองรับเฉพาะเลขบัตรทดสอบที่ขึ้นต้นด้วย 4242 หรือ 4000");
      if (!expIsValid(exp)) return fail("exp", "วันหมดอายุไม่ถูกต้อง (รูปแบบ MM/YY และยังไม่หมดอายุ)");
      if (!/^\d{3,4}$/.test(cvc)) return fail("cvc", "CVC ต้องเป็นตัวเลข 3–4 หลัก");
    }
    if (suspended) return fail("form", "บัญชีของคุณถูกระงับโดยผู้ดูแลระบบ จึงชำระเงินไม่ได้");
    if (!agreed) return fail("terms", "กรุณายอมรับเงื่อนไขการซื้อเกมดิจิทัลก่อนชำระเงิน");
    return true;
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setPaying(true);
    // TODO: ต่อกับ POST /api/orders/checkout — ส่งเฉพาะรายการเกม ไม่ส่งข้อมูลบัตร
    await new Promise((r) => setTimeout(r, 900));

    const declined = method === "card" && card.replace(/\D/g, "").startsWith("4000");
    // ล้างข้อมูลบัตรทันทีหลังใช้งาน ไม่ว่าผลจะเป็นอย่างไร
    setCard("");
    setExp("");
    setCvc("");

    if (declined) {
      setPaying(false);
      setError({ field: "card", text: "การชำระเงินถูกปฏิเสธ (บัตรทดสอบ 4000…) — ไม่มีการตัดเงิน ลองใหม่ด้วยเลข 4242…" });
      return;
    }

    const order = shop.checkout();
    if (!order) {
      setPaying(false);
      setError({ field: "form", text: "ไม่พบเกมที่ต้องชำระเงิน" });
      return;
    }
    navigate("/checkout/success", { replace: true, state: { orderId: order.id, email: email.trim() } });
  }

  const invalid = (field: string) => (error?.field === field ? true : undefined);
  const clear = () => setError(null);

  return (
    <>
      <OrderSteps current={1} />

      <div className="row row--between" style={{ alignItems: "baseline" }}>
        <h1 className="page-title">ชำระเงิน</h1>
        <Link to="/cart" className="link-gold">
          ← กลับไปตะกร้า
        </Link>
      </div>

      <div className="mock-notice" role="note">
        <span className="mock-notice__icon" aria-hidden="true">
          ⓘ
        </span>
        <span>ระบบชำระเงินจำลองสำหรับทดสอบ (Mock Payment) — ไม่มีการตัดเงินจริง และระบบไม่เก็บข้อมูลบัตร</span>
      </div>

      {suspended && (
        <div role="alert" className="alert alert--danger">
          <span>
            <b>บัญชีของคุณถูกระงับ</b> — ไม่สามารถซื้อเกมได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ
          </span>
        </div>
      )}

      <form className="checkout" onSubmit={handlePay} noValidate autoComplete="off" style={{ flexDirection: "row" }}>
        <div className="checkout__main">
          {/* ---------- ข้อมูลผู้ซื้อ ---------- */}
          <section className="card card--pad" aria-labelledby="buyer-title" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 id="buyer-title" style={{ fontSize: 20, fontWeight: 600 }}>
              ข้อมูลผู้ซื้อ
            </h2>
            <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
              <div className="field" style={{ flex: "1 1 220px" }}>
                <label htmlFor="co-name">ชื่อ</label>
                <input id="co-name" value={name} aria-invalid={invalid("name")} onChange={(e) => { setName(e.target.value); clear(); }} />
              </div>
              <div className="field" style={{ flex: "1 1 220px" }}>
                <label htmlFor="co-email">อีเมลรับใบเสร็จ</label>
                <input
                  id="co-email"
                  type="email"
                  value={email}
                  aria-invalid={invalid("email")}
                  onChange={(e) => { setEmail(e.target.value); clear(); }}
                />
              </div>
            </div>
          </section>

          {/* ---------- วิธีชำระเงิน ---------- */}
          <section className="card card--pad" aria-labelledby="pay-title" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 id="pay-title" style={{ fontSize: 20, fontWeight: 600 }}>
              วิธีชำระเงิน
            </h2>

            <div className="pay-options" role="radiogroup" aria-label="วิธีชำระเงิน">
              {(
                [
                  { id: "card", label: "บัตรเครดิต / เดบิต (จำลอง)", icon: "💳" },
                  { id: "promptpay", label: "พร้อมเพย์ QR (จำลอง)", icon: "▦" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={method === m.id}
                  className={method === m.id ? "pay-option is-selected" : "pay-option"}
                  onClick={() => {
                    setMethod(m.id);
                    clear();
                  }}
                >
                  <span aria-hidden="true">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {method === "card" ? (
              <>
                <div className="field">
                  <label htmlFor="co-card">หมายเลขบัตร (ใช้เลขทดสอบ)</label>
                  <input
                    id="co-card"
                    className="mono"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="4242 4242 4242 4242"
                    value={card}
                    aria-invalid={invalid("card")}
                    onChange={(e) => { setCard(formatCard(e.target.value)); clear(); }}
                  />
                </div>
                <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
                  <div className="field" style={{ flex: "1 1 160px" }}>
                    <label htmlFor="co-exp">วันหมดอายุ</label>
                    <input
                      id="co-exp"
                      className="mono"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/YY"
                      value={exp}
                      aria-invalid={invalid("exp")}
                      onChange={(e) => { setExp(formatExp(e.target.value)); clear(); }}
                    />
                  </div>
                  <div className="field" style={{ flex: "1 1 160px" }}>
                    <label htmlFor="co-cvc">CVC</label>
                    <input
                      id="co-cvc"
                      className="mono"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="123"
                      value={cvc}
                      aria-invalid={invalid("cvc")}
                      onChange={(e) => { setCvc(e.target.value.replace(/\D/g, "").slice(0, 4)); clear(); }}
                    />
                  </div>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  เลขบัตรทดสอบ: 4242… = สำเร็จ · 4000… = ถูกปฏิเสธ (ใช้สาธิตกรณีชำระเงินไม่สำเร็จ)
                </p>
              </>
            ) : (
              <div className="row" style={{ gap: 20, alignItems: "center" }}>
                <MockQr />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 220px" }}>
                  <b>สแกนเพื่อชำระ ฿{total.toLocaleString()}</b>
                  <span className="muted" style={{ fontSize: 14 }}>
                    QR นี้เป็นภาพจำลอง สแกนจริงไม่ได้ — กด “ยืนยันชำระเงิน” เพื่อจำลองว่าชำระสำเร็จ
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ---------- สรุปคำสั่งซื้อ ---------- */}
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

          <div className="row row--between" style={{ alignItems: "baseline" }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>ยอดชำระ</span>
            <span className="summary__total">฿{total.toLocaleString()}</span>
          </div>

          <label className="terms">
            <input
              type="checkbox"
              checked={agreed}
              aria-invalid={invalid("terms")}
              onChange={(e) => { setAgreed(e.target.checked); clear(); }}
            />
            ยอมรับเงื่อนไขการซื้อเกมดิจิทัล
          </label>

          {error && (
            <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
              {error.text}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={paying || suspended}>
            {paying ? "กำลังดำเนินการ…" : `ยืนยันชำระเงิน ฿${total.toLocaleString()}`}
          </button>

          <p className="summary__note">ราคาคำนวณใหม่ฝั่ง Server จากฐานข้อมูลทุกครั้ง · เชื่อมต่อผ่าน HTTPS</p>
        </aside>
      </form>
    </>
  );
}
