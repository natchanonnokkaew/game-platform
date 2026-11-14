import { useState } from "react";
import { Link } from "react-router-dom";
import { ACTIVITY, GAMES, MY_POSTS, MY_REVIEWS, PROFILE, RECENT_GAMES } from "../data/mock";
import { PencilIcon, ShareIcon } from "../components/icons";

const TABS = ["ภาพรวม", "เกมในคลัง", "รีวิว", "โพสต์คอมมูนิตี้"] as const;
type Tab = (typeof TABS)[number];

/** หา slug ของเกมจากชื่อ เพื่อลิงก์ไปหน้ารายละเอียดเกม */
function gameSlug(title: string) {
  return GAMES.find((g) => g.title === title)?.slug ?? "";
}

function CoverBanner() {
  return (
    <svg
      viewBox="0 0 1360 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <rect width="1360" height="200" fill="#13254A" />
      <circle cx="1080" cy="40" r="140" fill="#FFFFFF" opacity="0.1" />
      <circle cx="1080" cy="40" r="70" fill="#FFFFFF" opacity="0.12" />
      <path d="M0 150 L200 100 L380 140 L600 80 L820 140 L1040 100 L1360 140 L1360 200 L0 200Z" fill="#0A1324" opacity="0.6" />
      <path d="M0 180 L260 150 L520 175 L780 140 L1040 170 L1360 150 L1360 200 L0 200Z" fill="#0A1324" />
    </svg>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("ภาพรวม");

  return (
    <>
      {/* ---------- หัวโปรไฟล์ ---------- */}
      <section aria-label="ข้อมูลโปรไฟล์" className="card" style={{ overflow: "hidden", borderRadius: 18 }}>
        <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
          <CoverBanner />
        </div>

        <div
          style={{
            padding: "0 32px 28px",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px 28px",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              width: 132,
              height: 132,
              marginTop: -66,
              borderRadius: "50%",
              background: "#3B5A9A",
              border: "4px solid var(--surface-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-head)",
              fontSize: 56,
              fontWeight: 600,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.35), 0 0 30px rgba(255,255,255,0.3)",
            }}
          >
            {PROFILE.initial}
          </span>

          <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 34 }}>
                {PROFILE.name}
              </h1>
              <span className="muted">{PROFILE.handle}</span>
              <span className="pill pill--ok">● ออนไลน์</span>
            </div>
            <p className="dim" style={{ margin: 0, maxWidth: 640 }}>
              {PROFILE.bio}
            </p>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              {PROFILE.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
              <span className="muted" style={{ fontSize: 13, alignSelf: "center" }}>
                · {PROFILE.memberSince}
              </span>
            </div>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <Link to="/profile/edit" className="btn btn--primary">
              <PencilIcon />
              แก้ไขโปรไฟล์
            </Link>
            <button type="button" className="icon-btn" aria-label="แชร์โปรไฟล์" style={{ height: 48, width: 48 }}>
              <ShareIcon />
            </button>
          </div>
        </div>

        <dl
          style={{
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            borderTop: "1px solid var(--border-softer)",
          }}
        >
          {PROFILE.stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "18px 32px",
                borderRight:
                  i < PROFILE.stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              }}
            >
              <dt className="muted" style={{ fontSize: 13 }}>
                {s.label}
              </dt>
              <dd style={{ margin: 0, fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 600 }}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- แท็บ ---------- */}
      <div role="tablist" aria-label="ส่วนของโปรไฟล์" className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            className={t === tab ? "tab is-active" : "tab"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------- ภาพรวม ---------- */}
      {tab === "ภาพรวม" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          <section
            aria-labelledby="showcase-title"
            className="card card--pad"
            style={{ flex: "999 1 540px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <h2 id="showcase-title" style={{ fontSize: 18, fontWeight: 600 }}>
              เกมที่เล่นล่าสุด
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
              {RECENT_GAMES.slice(0, 4).map((g) => (
                <div
                  key={g.title}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--surface-input)",
                    border: "1px solid var(--border-softer)",
                  }}
                >
                  <span
                    style={{
                      aspectRatio: "16 / 9",
                      background: g.color,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 12,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 10,
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: g.accent,
                        opacity: 0.8,
                      }}
                    />
                    <b style={{ position: "relative", fontFamily: "var(--font-head)", fontSize: 20 }}>
                      {g.title}
                    </b>
                  </span>
                  <span style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>{g.hours} ชม.</span>
                      <span>{g.progress} สำเร็จ</span>
                    </span>
                    <span style={{ height: 6, borderRadius: 3, background: "var(--surface-nav)", overflow: "hidden" }}>
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          width: g.progress,
                          background: "var(--accent)",
                          boxShadow: "var(--glow-accent)",
                        }}
                      />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="act-title"
            className="card card--pad"
            style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}
          >
            <h2 id="act-title" style={{ fontSize: 18, fontWeight: 600 }}>
              กิจกรรมล่าสุด
            </h2>
            {ACTIVITY.map((a) => (
              <div key={a.text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    marginTop: 8,
                    flex: "none",
                    borderRadius: "50%",
                    background: a.color,
                    boxShadow: `0 0 8px ${a.color}`,
                  }}
                />
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.4 }}>
                  <span style={{ fontSize: 15 }}>{a.text}</span>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {a.time}
                  </span>
                </span>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ---------- เกมในคลัง ---------- */}
      {tab === "เกมในคลัง" && (
        <section
          aria-label="เกมในคลัง"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}
        >
          {RECENT_GAMES.map((g) => (
            <Link
              key={g.title}
              to="/library"
              className="card"
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", color: "var(--text)", textDecoration: "none" }}
            >
              <span
                style={{
                  aspectRatio: "16 / 10",
                  background: g.color,
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 14,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 12,
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: g.accent,
                    opacity: 0.8,
                  }}
                />
                <b style={{ position: "relative", fontFamily: "var(--font-head)", fontSize: 22 }}>{g.title}</b>
              </span>
              <span className="muted" style={{ padding: "12px 14px", fontSize: 14 }}>
                เล่นไปแล้ว {g.hours} ชั่วโมง
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* ---------- รีวิว ---------- */}
      {tab === "รีวิว" && (
        <section aria-label="รีวิวของฉัน" className="stack" style={{ gap: 14 }}>
          {MY_REVIEWS.map((r) => (
            <article key={r.game} className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="row row--between" style={{ flexWrap: "nowrap" }}>
                <Link
                  to={`/games/${gameSlug(r.game)}`}
                  style={{ color: "var(--text)", fontWeight: 700, textDecoration: "none" }}
                >
                  {r.game}
                </Link>
                <span className="star">{r.stars}</span>
              </div>
              <p className="dim" style={{ margin: 0 }}>
                {r.text}
              </p>
              <span className="muted" style={{ fontSize: 13 }}>
                {r.time} · มีคนเห็นด้วย {r.helpful} คน
              </span>
            </article>
          ))}
        </section>
      )}

      {/* ---------- โพสต์คอมมูนิตี้ ---------- */}
      {tab === "โพสต์คอมมูนิตี้" && (
        <section aria-label="โพสต์ของฉัน" className="stack" style={{ gap: 14 }}>
          {MY_POSTS.map((p) => (
            <Link
              key={p.title}
              to="/community"
              className="card card--pad"
              style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--text)", textDecoration: "none" }}
            >
              <span className="row muted" style={{ gap: 10, fontSize: 13 }}>
                <span className="tag" style={{ borderRadius: 999 }}>
                  {p.cat}
                </span>
                {p.game} · {p.time}
              </span>
              <b style={{ fontSize: 17 }}>{p.title}</b>
              <span className="muted" style={{ fontSize: 14 }}>
                ♥ {p.likes} · ความคิดเห็น {p.comments}
              </span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
