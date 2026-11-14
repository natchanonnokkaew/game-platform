import { useMemo, useState, type FormEvent } from "react";
import {
  COMMUNITY_RULES,
  GAMES,
  MY_GROUPS,
  ONLINE_FRIENDS,
  POSTS,
  POST_CATEGORIES,
  PROFILE,
  TRENDING,
  type Post,
} from "../data/mock";
import { ChatIcon, HeartIcon, ShareIcon } from "../components/icons";

const SORTS = ["ล่าสุด", "ยอดนิยม", "ที่ติดตาม"] as const;
type Sort = (typeof SORTS)[number];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [cat, setCat] = useState<string>("ทั้งหมด");
  const [sort, setSort] = useState<Sort>("ล่าสุด");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({ p1: true });
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftGame, setDraftGame] = useState("Echo of Siam");
  const [draftCat, setDraftCat] = useState("พูดคุยทั่วไป");
  const [spoiler, setSpoiler] = useState(false);
  const [showError, setShowError] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ทั้งหมด: posts.length };
    for (const p of posts) map[p.cat] = (map[p.cat] ?? 0) + 1;
    return map;
  }, [posts]);

  const feed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts.filter((p) => {
      if (cat !== "ทั้งหมด" && p.cat !== cat) return false;
      if (q && !`${p.title} ${p.body} ${p.author} ${p.game}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "ยอดนิยม") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "ที่ติดตาม") list = list.filter((p) => p.author !== "mint.pp");
    return list;
  }, [posts, cat, sort, query]);

  function submitPost(e: FormEvent) {
    e.preventDefault();
    if (!draftTitle.trim() || !draftBody.trim()) {
      setShowError(true);
      return;
    }
    const post: Post = {
      id: `n${Date.now()}`,
      author: "ณัฐชนน",
      initial: PROFILE.initial,
      color: "#3B5A9A",
      game: draftGame,
      cat: draftCat,
      title: draftTitle.trim(),
      body: draftBody.trim(),
      likes: 0,
      time: "เมื่อสักครู่",
      spoiler,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setDraftTitle("");
    setDraftBody("");
    setSpoiler(false);
    setShowError(false);
    setCat("ทั้งหมด");
    setSort("ล่าสุด");
  }

  function sendReply(id: string) {
    const text = (replies[id] ?? "").trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { author: "ณัฐชนน", initial: PROFILE.initial, text }] }
          : p
      )
    );
    setReplies((r) => ({ ...r, [id]: "" }));
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
      {/* ---------- แถบซ้าย ---------- */}
      <aside style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
            <span className="avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
              {PROFILE.initial}
            </span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <b>{PROFILE.name}</b>
              <span className="muted" style={{ fontSize: 13 }}>
                {PROFILE.handle}
              </span>
            </span>
          </div>
          <div role="search">
            <label htmlFor="post-search" className="sr-only">
              ค้นหาโพสต์
            </label>
            <input
              id="post-search"
              type="search"
              placeholder="ค้นหาโพสต์ เกม หรือผู้ใช้"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <nav aria-label="หมวดหมู่คอมมูนิตี้" className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>หมวดหมู่</h2>
          {POST_CATEGORIES.map((c) => {
            const on = c === cat;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  minHeight: 42,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "none",
                  background: on ? "var(--accent)" : "transparent",
                  color: on ? "var(--accent-ink)" : "var(--text)",
                  font: "inherit",
                  fontSize: 15,
                  fontWeight: on ? 600 : 400,
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: on ? "var(--glow-button)" : "none",
                }}
              >
                <span>{c}</span>
                <span style={{ fontSize: 13, opacity: 0.8 }}>{counts[c] ?? 0}</span>
              </button>
            );
          })}
        </nav>

        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>กลุ่มเกมของฉัน</h2>
          {MY_GROUPS.map((g) => (
            <div key={g.name} className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
              <span style={{ width: 36, height: 36, flex: "none", borderRadius: 8, background: g.color }} />
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 15 }}>{g.name}</span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {g.members}
                </span>
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* ---------- ฟีด ---------- */}
      <main style={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        <h1 className="page-title">คอมมูนิตี้</h1>

        <form
          aria-label="สร้างโพสต์ใหม่"
          className="card card--pad"
          onSubmit={submitPost}
          style={{ gap: 12 }}
        >
          <div className="field">
            <label htmlFor="post-title">หัวข้อโพสต์</label>
            <input
              id="post-title"
              placeholder="หัวข้อที่อยากคุย เช่น หาทีมลงดันเจี้ยนคืนนี้"
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                setShowError(false);
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="post-body">เนื้อหาโพสต์</label>
            <textarea
              id="post-body"
              rows={3}
              placeholder="เล่ารายละเอียด แชร์ทริค หรือถามคำถาม…"
              value={draftBody}
              onChange={(e) => {
                setDraftBody(e.target.value);
                setShowError(false);
              }}
            />
          </div>

          {showError && (
            <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
              กรุณากรอกทั้งหัวข้อและเนื้อหาก่อนโพสต์
            </p>
          )}

          <div className="row row--between">
            <div className="row" style={{ gap: 10 }}>
              <label className="sr-only" htmlFor="post-game">
                เกมที่เกี่ยวข้อง
              </label>
              <select
                id="post-game"
                value={draftGame}
                onChange={(e) => setDraftGame(e.target.value)}
                style={{ width: "auto", height: 44 }}
              >
                <option>ทั่วไป</option>
                {GAMES.map((g) => (
                  <option key={g.id}>{g.title}</option>
                ))}
              </select>

              <label className="sr-only" htmlFor="post-cat">
                หมวดหมู่
              </label>
              <select
                id="post-cat"
                value={draftCat}
                onChange={(e) => setDraftCat(e.target.value)}
                style={{ width: "auto", height: 44 }}
              >
                {POST_CATEGORIES.filter((c) => c !== "ทั้งหมด").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <label className="radio-row">
                <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
                มีสปอยล์
              </label>
            </div>

            <button type="submit" className="btn btn--primary">
              โพสต์
            </button>
          </div>
        </form>

        <div role="tablist" aria-label="เรียงโพสต์" className="tabs">
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={s === sort}
              className={s === sort ? "tab is-active" : "tab"}
              onClick={() => setSort(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {feed.length === 0 && <p className="muted">ยังไม่มีโพสต์ในหมวดนี้ ลองเป็นคนแรกที่เริ่มคุยดูไหมครับ</p>}

        {feed.map((p) => {
          const isLiked = !!liked[p.id];
          const isOpen = !!open[p.id];
          const hidden = p.spoiler && !revealed[p.id];

          return (
            <article key={p.id} className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    flex: "none",
                    borderRadius: "50%",
                    background: p.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                  }}
                >
                  {p.initial}
                </span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <b>{p.author}</b>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {p.game} · {p.time}
                  </span>
                </span>
                <span className="grow" />
                <span className="tag" style={{ borderRadius: 999 }}>
                  {p.cat}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 600 }}>{p.title}</h2>

              {p.spoiler && (
                <span className="pill pill--warn" style={{ alignSelf: "flex-start" }}>
                  ⚠ มีสปอยล์
                </span>
              )}

              {hidden ? (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => ({ ...r, [p.id]: true }))}
                  className="btn btn--secondary"
                  style={{ alignSelf: "flex-start" }}
                >
                  แสดงเนื้อหาที่มีสปอยล์
                </button>
              ) : (
                <p className="dim" style={{ margin: 0, whiteSpace: "pre-line" }}>
                  {p.body}
                </p>
              )}

              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  aria-pressed={isLiked}
                  onClick={() => setLiked((l) => ({ ...l, [p.id]: !isLiked }))}
                  className="btn btn--sm"
                  style={{
                    background: isLiked ? "#3A2333" : "transparent",
                    color: isLiked ? "#FF8FB0" : "var(--text)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <HeartIcon size={16} filled={isLiked} />
                  {p.likes + (isLiked ? 1 : 0)}
                </button>

                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))}
                  className="btn btn--secondary btn--sm"
                >
                  <ChatIcon size={16} />
                  ความคิดเห็น {p.comments.length}
                </button>

                <button type="button" className="btn btn--secondary btn--sm">
                  <ShareIcon size={16} />
                  แชร์
                </button>
                <button type="button" className="btn btn--sm" style={{ background: "transparent", color: "var(--text-muted)" }}>
                  รายงาน
                </button>
              </div>

              {isOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border-softer)", paddingTop: 12 }}>
                  {p.comments.map((c, i) => (
                    <div key={`${c.author}-${i}`} className="row" style={{ gap: 10, flexWrap: "nowrap", alignItems: "flex-start" }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          flex: "none",
                          borderRadius: "50%",
                          background: "var(--surface-input)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {c.initial}
                      </span>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <b style={{ fontSize: 14 }}>{c.author}</b>
                        <span className="dim" style={{ fontSize: 15 }}>
                          {c.text}
                        </span>
                      </span>
                    </div>
                  ))}

                  <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                    <label htmlFor={`reply-${p.id}`} className="sr-only">
                      ตอบกลับโพสต์
                    </label>
                    <input
                      id={`reply-${p.id}`}
                      placeholder="เขียนความคิดเห็น…"
                      value={replies[p.id] ?? ""}
                      onChange={(e) => setReplies((r) => ({ ...r, [p.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendReply(p.id);
                        }
                      }}
                    />
                    <button type="button" className="btn btn--primary" onClick={() => sendReply(p.id)}>
                      ส่ง
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </main>

      {/* ---------- แถบขวา ---------- */}
      <aside aria-label="ข้อมูลเสริม" style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>หัวข้อมาแรง</h2>
          {TRENDING.map((t) => (
            <div key={t.tag} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "var(--accent)", fontSize: 15 }}>{t.tag}</span>
              <span className="muted" style={{ fontSize: 13 }}>
                {t.count}
              </span>
            </div>
          ))}
        </div>

        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>เพื่อนที่ออนไลน์</h2>
          {ONLINE_FRIENDS.map((f) => (
            <div key={f.name} className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
              <span style={{ position: "relative", flex: "none" }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: f.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {f.initial}
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--ok-fg)",
                    border: "2px solid var(--surface-card)",
                  }}
                />
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 15 }}>{f.name}</span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {f.status}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>กติกาคอมมูนิตี้</h2>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, fontSize: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {COMMUNITY_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
