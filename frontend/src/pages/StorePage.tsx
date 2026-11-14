import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { FEATURED, GAMES, GENRES } from "../data/mock";
import { useCart } from "../store/cart";

type PriceBand = "all" | "lt200" | "200to400" | "gt400";
type RatingBand = "all" | "4.5" | "4.0";
type SortKey = "popular" | "newest" | "price_asc" | "rating";

function HeroArt() {
  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <rect width="800" height="420" fill="#1A2440" />
      <circle cx="560" cy="150" r="110" fill="#FFA94D" opacity="0.9" />
      <path d="M0 300 L140 210 L260 270 L400 170 L540 260 L680 190 L800 250 L800 420 L0 420Z" fill="#2B3A66" />
      <path d="M0 340 L120 300 L250 330 L380 280 L520 330 L660 290 L800 320 L800 420 L0 420Z" fill="#202C4F" />
      <path d="M300 330 L300 250 L330 250 L345 200 L360 160 L375 200 L390 250 L420 250 L420 330Z" fill="#141B33" />
      <path d="M352 160 L360 110 L368 160Z" fill="#141B33" />
      <path d="M0 380 L800 380 L800 420 L0 420Z" fill="#141B33" />
    </svg>
  );
}

export default function StorePage() {
  const [genre, setGenre] = useState<string>("ทั้งหมด");
  const [price, setPrice] = useState<PriceBand>("all");
  const [rating, setRating] = useState<RatingBand>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [query, setQuery] = useState("");
  const cart = useCart();

  const counts = useMemo(() => {
    const map: Record<string, number> = { ทั้งหมด: GAMES.length };
    for (const g of GAMES) map[g.genre] = (map[g.genre] ?? 0) + 1;
    return map;
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = GAMES.filter((g) => {
      if (genre !== "ทั้งหมด" && g.genre !== genre) return false;
      if (price === "lt200" && g.price >= 200) return false;
      if (price === "200to400" && (g.price < 200 || g.price > 400)) return false;
      if (price === "gt400" && g.price <= 400) return false;
      if (rating === "4.5" && g.rating < 4.5) return false;
      if (rating === "4.0" && g.rating < 4.0) return false;
      if (q && !`${g.title} ${g.dev} ${g.genre}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") sorted.reverse();
    else sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [genre, price, rating, sort, query]);

  return (
    <>
      {/* ---------- แบนเนอร์เกมแนะนำ ---------- */}
      <section aria-labelledby="featured-title">
        <div
          className="card"
          style={{ display: "flex", flexWrap: "wrap", overflow: "hidden", borderRadius: 16 }}
        >
          <div style={{ flex: "1 1 520px", minHeight: 380, position: "relative", overflow: "hidden" }}>
            <HeroArt />
            <span style={{ position: "absolute", left: 24, bottom: 20, display: "flex", gap: 8 }}>
              <span style={{ width: 28, height: 6, borderRadius: 3, background: "var(--accent)" }} />
              <span style={{ width: 10, height: 6, borderRadius: 3, background: "#5B6578" }} />
              <span style={{ width: 10, height: 6, borderRadius: 3, background: "#5B6578" }} />
            </span>
          </div>

          <div
            style={{
              flex: "1 1 380px",
              padding: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <span className="pill pill--accent" style={{ alignSelf: "flex-start", padding: "4px 12px", fontSize: 14 }}>
              เกมแนะนำประจำสัปดาห์
            </span>
            <h1 id="featured-title" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15 }}>
              {FEATURED.title}
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              RPG ผจญภัยในอาณาจักรโบราณ สำรวจเมืองริมน้ำ ไขปริศนาวัดร้าง และสร้างทีมของคุณเอง
            </p>
            <div className="row" style={{ gap: 8 }}>
              <span className="tag">RPG</span>
              <span className="tag">Story Rich</span>
              <span className="tag">Single-player</span>
            </div>
            <div className="row" style={{ alignItems: "baseline", gap: 12, marginTop: 4 }}>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 600 }}>
                ฿{FEATURED.price}
              </span>
              <span className="muted" style={{ fontSize: 14 }}>
                <span className="star">★</span> {FEATURED.rating} · รีวิว{" "}
                {FEATURED.reviews.toLocaleString()} รายการ
              </span>
            </div>
            <div className="row" style={{ gap: 12, marginTop: 6 }}>
              <Link to={`/games/${FEATURED.slug}`} className="btn btn--primary">
                ดูรายละเอียด
              </Link>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => cart.toggle(FEATURED.id)}
              >
                {cart.has(FEATURED.id) ? "อยู่ในตะกร้าแล้ว" : "เพิ่มลงตะกร้า"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ประเภทเกม (ชิปแนวนอน) ---------- */}
      <section aria-labelledby="genre-title" className="stack" style={{ gap: 12 }}>
        <h2 id="genre-title" style={{ fontSize: 22, fontWeight: 600 }}>
          ประเภทเกม
        </h2>
        <div className="chip-row">
          {GENRES.map((name) => (
            <button
              key={name}
              type="button"
              className={name === genre ? "chip is-active" : "chip"}
              aria-pressed={name === genre}
              onClick={() => setGenre(name)}
            >
              <span>{name}</span>
              <span className="chip__count">{counts[name] ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- รายการเกม + ตัวกรอง ---------- */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
        <aside
          aria-label="ตัวกรอง"
          className="card card--pad"
          style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 24 }}
        >
          <fieldset>
            <legend>ช่วงราคา</legend>
            {(
              [
                ["all", "ทุกราคา"],
                ["lt200", "ต่ำกว่า ฿200"],
                ["200to400", "฿200 – ฿400"],
                ["gt400", "มากกว่า ฿400"],
              ] as [PriceBand, string][]
            ).map(([value, label]) => (
              <label key={value} className="radio-row">
                <input
                  type="radio"
                  name="price"
                  checked={price === value}
                  onChange={() => setPrice(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>คะแนนรีวิว</legend>
            {(
              [
                ["all", "ทั้งหมด"],
                ["4.5", "★ 4.5 ขึ้นไป"],
                ["4.0", "★ 4.0 ขึ้นไป"],
              ] as [RatingBand, string][]
            ).map(([value, label]) => (
              <label key={value} className="radio-row">
                <input
                  type="radio"
                  name="rating"
                  checked={rating === value}
                  onChange={() => setRating(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <div className="field">
            <label htmlFor="catalog-filter">ค้นหาในผลลัพธ์</label>
            <input
              id="catalog-filter"
              type="search"
              placeholder="ชื่อเกมหรือผู้พัฒนา"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </aside>

        <div style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="row row--between">
            <div>
              <h2 className="section-title" style={{ fontSize: 28 }}>
                {genre === "ทั้งหมด" ? "เกมทั้งหมด" : `เกมประเภท ${genre}`}
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                แสดง {shown.length} เกม
              </p>
            </div>
            <label className="row muted" style={{ gap: 10, fontSize: 14 }}>
              เรียงตาม
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                style={{ width: "auto", height: 44 }}
              >
                <option value="popular">ยอดนิยม</option>
                <option value="newest">ใหม่ล่าสุด</option>
                <option value="price_asc">ราคา: ต่ำ → สูง</option>
                <option value="rating">คะแนนรีวิว</option>
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="muted">ไม่พบเกมที่ตรงกับตัวกรอง ลองปรับเงื่อนไขดูครับ</p>
          ) : (
            <div className="game-grid">
              {shown.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
