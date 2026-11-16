import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RATING_BARS, SCREENSHOTS, SYSTEM_REQS } from "../data/mock";
import { HeartIcon, LockIcon } from "../components/icons";
import { useShop } from "../store/shop";
import { SOON } from "../lib/soon";

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const shop = useShop();
  const game = shop.findGame(slug ?? "");

  const [shot, setShot] = useState(0);

  if (!game) {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <h1 className="page-title">ไม่พบเกมนี้</h1>
        <p className="muted" style={{ margin: 0 }}>
          เกมอาจถูกนำออกจากร้านค้า หรือยังไม่ได้รับการอนุมัติ
        </p>
        <Link to="/" className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
          กลับไปหน้าร้านค้า
        </Link>
      </div>
    );
  }

  const current = SCREENSHOTS[shot];
  const inCart = shop.has(game.id);
  const owned = shop.owns(game.id);
  /** ถ้าผู้พัฒนาอัปโหลดภาพหน้าจอจริง ให้ใช้ภาพนั้น ไม่งั้นใช้ภาพจำลอง */
  const shots = game.screenshots.length > 0 ? game.screenshots : null;

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
              {shots ? (
                <img
                  src={shots[Math.min(shot, shots.length - 1)]}
                  alt={`ภาพหน้าจอของ ${game.title}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
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
              )}
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
                {shots
                  ? `ภาพหน้าจอ · ${Math.min(shot, shots.length - 1) + 1}/${shots.length}`
                  : `${current.caption} · ${shot + 1}/${SCREENSHOTS.length}`}
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
                {shots ? "อัปโหลดโดยผู้พัฒนา" : "ตัวอย่างภาพ (placeholder)"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
              {(shots ?? SCREENSHOTS).map((item, i) => (
                <button
                  key={typeof item === "string" ? item : item.caption}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-label={`ดูภาพหน้าจอที่ ${i + 1}`}
                  aria-pressed={i === shot}
                  style={{
                    aspectRatio: "16 / 9",
                    borderRadius: 8,
                    background: typeof item === "string" ? "var(--surface-input)" : item.bg,
                    border: `2px solid ${i === shot ? "var(--accent)" : "transparent"}`,
                    padding: 0,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    height: "auto",
                    width: "100%",
                  }}
                >
                  {typeof item === "string" ? (
                    <img src={item} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span
                      style={{
                        position: "absolute",
                        right: "10%",
                        top: "18%",
                        width: "34%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        background: item.accent,
                        opacity: 0.85,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {game.videoUrl && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>คลิปแนะนำเกม</h3>
                {/youtube\.com|youtu\.be|vimeo\.com/.test(game.videoUrl) ? (
                  <a href={game.videoUrl} target="_blank" rel="noreferrer" className="btn btn--secondary" style={{ alignSelf: "flex-start" }}>
                    เปิดคลิปวิดีโอ ↗
                  </a>
                ) : (
                  <video
                    src={game.videoUrl}
                    controls
                    style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border-soft)" }}
                  />
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="section-title" style={{ marginBottom: 12 }}>
              เกี่ยวกับเกมนี้
            </h2>
            <p className="dim" style={{ marginTop: 0, marginBottom: 0 }}>
              {game.description}
            </p>
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

          {/* รีวิวจากผู้เล่น — ยังไม่เปิดใช้ในขอบเขต 30% (ตาราง reviews อยู่ในส่วนอนาคตของ ER Diagram) */}
          <section aria-labelledby="rev-title" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="row row--between" style={{ alignItems: "baseline" }}>
              <h2 id="rev-title" className="section-title">
                รีวิวจากผู้เล่น
                <span className="soon-badge" style={{ verticalAlign: "middle" }}>เร็ว ๆ นี้</span>
              </h2>
              <button type="button" className="btn btn--secondary btn--sm is-soon" aria-disabled="true" title={SOON}>
                เขียนรีวิว
              </button>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              ระบบรีวิวและการตอบกลับจากผู้พัฒนาจะเปิดใช้ในเวอร์ชันถัดไป
            </p>
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
            {owned ? (
              <>
                <span className="pill pill--ok" style={{ alignSelf: "flex-start" }}>
                  ✓ คุณเป็นเจ้าของเกมนี้แล้ว
                </span>
                <Link to="/library" className="btn btn--primary btn--lg btn--block">
                  ไปที่คลังเกม
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="btn btn--primary btn--lg btn--block"
                  onClick={() => shop.add(game.id)}
                >
                  ซื้อเลย
                </Link>
                <button
                  type="button"
                  className="btn btn--secondary btn--lg btn--block"
                  onClick={() => shop.toggle(game.id)}
                >
                  {inCart ? "อยู่ในตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
                </button>
                <button
                  type="button"
                  className="btn btn--block is-soon"
                  aria-disabled="true"
                  title={SOON}
                  style={{ background: "var(--surface-input)", color: "var(--text)", height: 44 }}
                >
                  <HeartIcon size={18} />
                  เพิ่มใน Wishlist
                  <span className="soon-badge">เร็ว ๆ นี้</span>
                </button>
              </>
            )}
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
              <dd style={{ margin: 0 }}>{game.releaseDate}</dd>
              <dt className="muted">ขนาดไฟล์</dt>
              <dd style={{ margin: 0 }}>{game.sizeMB} MB</dd>
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
