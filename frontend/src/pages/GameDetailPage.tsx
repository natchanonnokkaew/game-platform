import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  GAMES,
  GAME_REVIEWS,
  PROFILE,
  RATING_BARS,
  SCREENSHOTS,
  SYSTEM_REQS,
  type GameReview,
} from "../data/mock";
import { HeartIcon, LockIcon } from "../components/icons";
import { useCart } from "../store/cart";

const STAR_WORDS = ["ยังไม่ได้เลือก", "แย่", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"];

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const game = GAMES.find((g) => g.slug === slug) ?? GAMES[0];

  const [shot, setShot] = useState(0);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [myReviews, setMyReviews] = useState<GameReview[]>([]);
  const cart = useCart();

  const current = SCREENSHOTS[shot];
  const inCart = cart.has(game.id);
  const wish = cart.inWishlist(game.id);

  return (
    <>
      <nav aria-label="เส้นทาง" className="muted" style={{ fontSize: 14 }}>
        <Link to="/" style={{ color: "var(--text-muted)" }}>
          ร้านค้า
        </Link>
        {" / "}
        <span>{game.genre}</span>
        {" / "}
        <span style={{ color: "var(--text)" }}>{game.title}</span>
      </nav>

      <header className="stack" style={{ gap: 10 }}>
        <h1 className="page-title" style={{ fontSize: 42 }}>
          {game.title}
        </h1>
        <div className="row muted" style={{ gap: 16, fontSize: 15 }}>
          <span>โดย {game.dev}</span>
          <span>
            <span className="star">★</span> {game.rating.toFixed(1)} · รีวิว{" "}
            {game.reviews.toLocaleString()} รายการ
          </span>
          <span className="tag">{game.genre}</span>
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
        {/* ---------- คอลัมน์ซ้าย ---------- */}
        <div style={{ flex: "999 1 620px", minWidth: 0, display: "flex", flexDirection: "column", gap: 40 }}>
          <section aria-label="ภาพหน้าจอ" className="stack" style={{ gap: 12 }}>
            <div
              style={{
                aspectRatio: "16 / 9",
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                background: current.bg,
                border: "1px solid var(--border-soft)",
              }}
            >
              <svg
                viewBox="0 0 800 450"
                preserveAspectRatio="xMidYMid slice"
                role="img"
                aria-label={current.caption}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                <circle cx={current.sunX} cy="140" r="100" fill={current.accent} opacity="0.85" />
                <path d="M0 320 L150 230 L280 290 L420 190 L560 280 L700 210 L800 260 L800 450 L0 450Z" fill="#000" opacity="0.25" />
                <path d="M0 370 L130 330 L260 360 L400 310 L540 360 L680 320 L800 350 L800 450 L0 450Z" fill="#000" opacity="0.3" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 14,
                  padding: "4px 12px",
                  borderRadius: 6,
                  background: "var(--bg)",
                  fontSize: 14,
                }}
              >
                {current.caption} · {shot + 1}/{SCREENSHOTS.length}
              </span>
              <span
                style={{
                  position: "absolute",
                  right: 16,
                  top: 14,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--bg)",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                ตัวอย่างภาพ (placeholder)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
              {SCREENSHOTS.map((s, i) => (
                <button
                  key={s.caption}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-label={`ดู${s.caption}`}
                  aria-pressed={i === shot}
                  style={{
                    aspectRatio: "16 / 9",
                    borderRadius: 8,
                    background: s.bg,
                    border: `2px solid ${i === shot ? "var(--accent)" : "transparent"}`,
                    padding: 0,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    height: "auto",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      right: "10%",
                      top: "18%",
                      width: "34%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      background: s.accent,
                      opacity: 0.85,
                    }}
                  />
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="section-title" style={{ marginBottom: 12 }}>
              เกี่ยวกับเกมนี้
            </h2>
            <p className="dim" style={{ marginTop: 0, marginBottom: 12 }}>
              ออกเดินทางในอาณาจักรสมมติริมแม่น้ำ ที่ซึ่งเสียงระฆังจากวัดร้างปลุกพลังโบราณให้ตื่นขึ้น
              ผู้เล่นรับบทนักเดินทางที่ต้องรวบรวมเพื่อนร่วมทาง ค้นหาเศษชิ้นส่วนของระฆังทั้งเจ็ด
              และตัดสินใจว่าจะใช้พลังนั้นปกป้องหรือเปลี่ยนแปลงโลก
            </p>
            <ul className="dim" style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>ระบบต่อสู้แบบผลัดตาที่ผสมการจับจังหวะ</li>
              <li>เนื้อเรื่องแยกเส้นทาง 3 ตอนจบ ขึ้นกับการตัดสินใจของผู้เล่น</li>
              <li>รองรับภาษาไทยและอังกฤษ ทั้งเสียงพากย์และคำบรรยาย</li>
            </ul>
          </section>

          <section aria-labelledby="req-title">
            <h2 id="req-title" className="section-title" style={{ marginBottom: 12 }}>
              ความต้องการของระบบ
            </h2>
            <div className="table-wrap">
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "22%" }} />
                    <th scope="col">ขั้นต่ำ</th>
                    <th scope="col">แนะนำ</th>
                  </tr>
                </thead>
                <tbody>
                  {SYSTEM_REQS.map((r) => (
                    <tr key={r.label}>
                      <th scope="row" style={{ textAlign: "left", color: "var(--text-muted)", fontWeight: 500 }}>
                        {r.label}
                      </th>
                      <td>{r.min}</td>
                      <td>{r.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="rev-title" className="stack" style={{ gap: 16 }}>
            <div className="row row--between" style={{ alignItems: "baseline" }}>
              <h2 id="rev-title" className="section-title">
                รีวิวจากผู้เล่น
              </h2>
              <span className="muted" style={{ fontSize: 14 }}>
                เฉพาะผู้ที่มีเกมในคลังเท่านั้นที่รีวิวได้
              </span>
            </div>

            <form
              aria-label="เขียนรีวิว"
              className="card card--pad"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (stars === 0) {
                  setReviewError("กรุณาให้คะแนนก่อนส่งรีวิว");
                  return;
                }
                if (!reviewText.trim()) {
                  setReviewError("กรุณาเขียนความคิดเห็นของคุณ");
                  return;
                }
                // TODO: ต่อกับ POST /api/reviews
                setMyReviews((prev) => [
                  {
                    author: PROFILE.name,
                    initial: PROFILE.initial,
                    avatarColor: "#3B5A9A",
                    stars,
                    text: reviewText.trim(),
                    meta: "เพิ่งเขียนเมื่อสักครู่",
                  },
                  ...prev,
                ]);
                setStars(0);
                setReviewText("");
                setReviewError(null);
              }}
            >
              <div className="row" style={{ gap: 12 }}>
                <span style={{ fontWeight: 600 }}>ให้คะแนน</span>
                <div role="radiogroup" aria-label="คะแนน" style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={n === stars}
                      aria-label={`${n} ดาว`}
                      onClick={() => setStars(n)}
                      style={{
                        width: 44,
                        height: 44,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: 28,
                        lineHeight: "44px",
                        color: n <= stars ? "var(--warn-fg)" : "#3A4150",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 14 }}>
                  {STAR_WORDS[stars]}
                </span>
              </div>

              <div className="field">
                <label htmlFor="review-text">ความคิดเห็นของคุณ</label>
                <textarea
                  id="review-text"
                  rows={3}
                  placeholder="เล่าประสบการณ์ของคุณกับเกมนี้…"
                  value={reviewText}
                  onChange={(e) => {
                    setReviewText(e.target.value);
                    setReviewError(null);
                  }}
                />
              </div>

              {reviewError && (
                <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
                  {reviewError}
                </p>
              )}

              <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-end", height: 44 }}>
                ส่งรีวิว
              </button>
            </form>

            {[...myReviews, ...GAME_REVIEWS].map((r, i) => (
              <article
                key={`${r.author}-${i}`}
                className="card card--pad"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div className="row row--between">
                  <span className="row" style={{ gap: 10 }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: r.avatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                      }}
                    >
                      {r.initial}
                    </span>
                    <b>{r.author}</b>
                  </span>
                  <span className="star" aria-label={`${r.stars} ดาว`}>
                    {"★".repeat(r.stars)}
                    <span style={{ color: "#3A4150" }}>{"★".repeat(5 - r.stars)}</span>
                  </span>
                </div>
                <p className="dim" style={{ margin: 0 }}>
                  {r.text}
                </p>
                <span className="muted" style={{ fontSize: 13 }}>
                  {r.meta}
                </span>
                {r.devReply && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "var(--surface-input)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
                      ตอบกลับจากผู้พัฒนา · {r.devReply.studio}
                    </span>
                    <span className="dim" style={{ fontSize: 15 }}>
                      {r.devReply.text}
                    </span>
                  </div>
                )}
              </article>
            ))}
          </section>
        </div>

        {/* ---------- คอลัมน์ขวา ---------- */}
        <aside style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="muted" style={{ fontSize: 14 }}>
              ราคา
            </span>
            <span style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 600, lineHeight: 1 }}>
              ฿{game.price}
            </span>
            <Link
              to="/cart"
              className="btn btn--primary btn--lg btn--block"
              onClick={() => cart.add(game.id)}
            >
              ซื้อเลย
            </Link>
            <button
              type="button"
              className="btn btn--secondary btn--lg btn--block"
              onClick={() => cart.toggle(game.id)}
            >
              {inCart ? "อยู่ในตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
            </button>
            <button
              type="button"
              className="btn btn--block"
              aria-pressed={wish}
              onClick={() => cart.toggleWishlist(game.id)}
              style={{ background: "var(--surface-input)", color: "var(--text)", height: 44 }}
            >
              <span style={{ color: "#FF8FA3", display: "flex" }}>
                <HeartIcon size={18} filled={wish} />
              </span>
              {wish ? "อยู่ใน Wishlist แล้ว" : "เพิ่มใน Wishlist"}
            </button>
            <p className="muted" style={{ margin: 0, fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ flex: "none", marginTop: 3, display: "flex" }}>
                <LockIcon />
              </span>
              ชำระเงินปลอดภัยผ่าน HTTPS · ได้รับ License Key และเข้าคลังเกมทันทีหลังชำระเงิน
            </p>
          </div>

          <div className="card card--pad">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>ข้อมูลเกม</h2>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "10px 16px",
                fontSize: 15,
              }}
            >
              <dt className="muted">ผู้พัฒนา</dt>
              <dd style={{ margin: 0 }}>{game.dev}</dd>
              <dt className="muted">ประเภท</dt>
              <dd style={{ margin: 0 }}>{game.genre}</dd>
              <dt className="muted">วางจำหน่าย</dt>
              <dd style={{ margin: 0 }}>12 ส.ค. 2569</dd>
              <dt className="muted">ขนาดไฟล์</dt>
              <dd style={{ margin: 0 }}>148 MB</dd>
              <dt className="muted">ภาษา</dt>
              <dd style={{ margin: 0 }}>ไทย, อังกฤษ</dd>
            </dl>
          </div>

          <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 600, lineHeight: 1 }}>
                {game.rating.toFixed(1)}
              </span>
              <span className="muted" style={{ fontSize: 14 }}>
                จาก {game.reviews.toLocaleString()} รีวิว
              </span>
            </div>
            {RATING_BARS.map((b) => (
              <div key={b.label} className="row" style={{ gap: 10, fontSize: 14, flexWrap: "nowrap" }}>
                <span className="muted" style={{ width: 28 }}>
                  {b.label}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: "var(--surface-input)",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ display: "block", height: "100%", width: b.pct, background: "var(--warn-fg)" }} />
                </span>
                <span className="muted" style={{ width: 40, textAlign: "right" }}>
                  {b.pct}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
