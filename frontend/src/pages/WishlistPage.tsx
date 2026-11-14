import { Link } from "react-router-dom";
import { GAMES } from "../data/mock";
import GameCard from "../components/GameCard";
import { useCart } from "../store/cart";

export default function WishlistPage() {
  const cart = useCart();
  const items = GAMES.filter((g) => cart.inWishlist(g.id));

  return (
    <>
      <nav aria-label="เส้นทาง" className="muted" style={{ fontSize: 14 }}>
        <Link to="/" style={{ color: "var(--text-muted)" }}>
          ร้านค้า
        </Link>
        {" / "}
        <span style={{ color: "var(--text)" }}>รายการที่ต้องการ</span>
      </nav>

      <div className="row row--between row--end">
        <div>
          <h1 className="page-title">รายการที่ต้องการ</h1>
          <p className="muted" style={{ margin: 0 }}>
            {items.length === 0 ? "ยังไม่มีเกมในรายการ" : `${items.length} เกมที่คุณสนใจ`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => items.forEach((g) => cart.add(g.id))}
          >
            ใส่ตะกร้าทั้งหมด
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <p className="dim" style={{ margin: 0 }}>
            กดปุ่มรูปหัวใจในหน้ารายละเอียดเกม เพื่อเก็บเกมที่สนใจไว้ดูทีหลัง
          </p>
          <Link to="/" className="btn btn--primary">
            ไปหน้าร้านค้า
          </Link>
        </div>
      ) : (
        <div className="game-grid">
          {items.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  );
}
