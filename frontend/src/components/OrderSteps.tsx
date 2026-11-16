import type { Game } from "../data/mock";
import { CoverArt } from "./GameCard";

const STEPS = ["ตะกร้าสินค้า", "ชำระเงิน", "สำเร็จ"];

/** แถบขั้นตอน ตะกร้า → ชำระเงิน → สำเร็จ  (current = ลำดับขั้นปัจจุบัน 0–2, ส่ง 3 เมื่อเสร็จทุกขั้น) */
export default function OrderSteps({ current }: { current: number }) {
  return (
    <ol className="card steps" aria-label="ขั้นตอนการสั่งซื้อ">
      {STEPS.map((label, i) => {
        const state = i < current ? "is-done" : i === current ? "is-active" : "";
        return (
          <li key={label} className={`step ${state}`} aria-current={i === current ? "step" : undefined}>
            <span className="step__dot">{i < current ? "✓" : i + 1}</span>
            <span style={{ whiteSpace: "nowrap" }}>{label}</span>
            {i < STEPS.length - 1 && <span className="step__line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** ภาพปกเกมขนาดย่อ — ใช้รูปจริงถ้าผู้พัฒนาอัปโหลด ไม่งั้นใช้ภาพปกจำลอง */
export function GameThumb({ game }: { game: Game }) {
  return (
    <span className="cart-item__cover" style={{ background: game.color }}>
      {game.coverUrl ? <img src={game.coverUrl} alt="" /> : <CoverArt color={game.color} accent={game.accent} />}
    </span>
  );
}

/** ซ่อนตัวกลางของ License Key เหลือเฉพาะชุดท้าย เช่น HSG-••••-••••-7QX2 */
export function maskKey(key: string) {
  const parts = key.split("-");
  return parts.map((p, i) => (i === 0 || i === parts.length - 1 ? p : "••••")).join("-");
}
