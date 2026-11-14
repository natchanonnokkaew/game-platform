import { Link } from "react-router-dom";
import type { Game } from "../data/mock";
import { HeartIcon } from "./icons";
import { useShop } from "../store/shop";

/** ภาพปกจำลอง — ใช้แทนภาพจริงจนกว่าจะต่อ API ที่ส่ง coverUrl มา */
export function CoverArt({ color, accent }: { color: string; accent: string }) {
  return (
    <svg
      viewBox="0 0 200 125"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <rect width="200" height="125" fill={color} />
      <circle cx="160" cy="28" r="58" fill={accent} opacity="0.6" />
      <circle cx="30" cy="125" r="48" fill={accent} opacity="0.25" />
      <path d="M0 105 L60 80 L110 98 L160 72 L200 90 L200 125 L0 125Z" fill="#000000" opacity="0.25" />
    </svg>
  );
}

export default function GameCard({ game }: { game: Game }) {
  const shop = useShop();
  const inCart = shop.has(game.id);
  const wished = shop.inWishlist(game.id);

  return (
    <article className="game-card">
      <Link
        to={`/games/${game.slug}`}
        className="game-card__art"
        style={{ background: game.color }}
        aria-label={`ดูรายละเอียด ${game.title}`}
      >
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <CoverArt color={game.color} accent={game.accent} />
        )}
        <span className="game-card__title-art">{game.title}</span>
      </Link>

      <div className="game-card__body">
        <div className="row row--between" style={{ fontSize: 14, color: "var(--text-muted)", gap: 8 }}>
          <span>{game.genre}</span>
          <span>
            <span className="star">★</span> {game.rating.toFixed(1)}
          </span>
        </div>

        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{game.dev}</span>

        <div className="game-card__foot">
          <span className="price">฿{game.price}</span>
          <span className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
            <button
              type="button"
              className="icon-btn"
              style={{ width: 40, height: 40 }}
              aria-pressed={wished}
              aria-label={wished ? `นำ ${game.title} ออกจากรายการที่ต้องการ` : `เพิ่ม ${game.title} ในรายการที่ต้องการ`}
              onClick={() => shop.toggleWishlist(game.id)}
            >
              <span style={{ color: wished ? "#FF8FA3" : "var(--text)", display: "flex" }}>
                <HeartIcon size={18} filled={wished} />
              </span>
            </button>
            <button
              type="button"
              className={inCart ? "btn btn--secondary btn--sm" : "btn btn--primary btn--sm"}
              onClick={() => shop.toggle(game.id)}
            >
              {inCart ? "ในตะกร้าแล้ว" : "ใส่ตะกร้า"}
            </button>
          </span>
        </div>
      </div>
    </article>
  );
}
