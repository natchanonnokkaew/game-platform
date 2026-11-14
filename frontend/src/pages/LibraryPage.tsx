import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ORDER_STATUS } from "../data/mock";
import { CheckCircleIcon, DownloadIcon } from "../components/icons";
import { useShop, type PaidOrder } from "../store/shop";

export default function LibraryPage() {
  const location = useLocation();
  const paid = (location.state as { paid?: PaidOrder } | null)?.paid;
  const shop = useShop();

  const [sel, setSel] = useState(0);
  const [showKey, setShowKey] = useState(false);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  /** คลังเกม = เกมที่ซื้อจริงเท่านั้น */
  const owned = shop.library
    .map((entry) => ({ entry, game: shop.games.find((g) => g.id === entry.gameId)! }))
    .filter((x) => x.game);

  const list = owned.filter((x) => x.game.title.toLowerCase().includes(query.trim().toLowerCase()));
  const current = owned[Math.min(sel, owned.length - 1)];

  async function copyKey() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.entry.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* เบราว์เซอร์ไม่อนุญาต — ผู้ใช้คัดลอกเองได้ */
    }
  }

  return (
    <>
      {/* แบนเนอร์นี้ขึ้นเฉพาะตอนเพิ่งชำระเงินสำเร็จเท่านั้น */}
      {paid && !bannerClosed && (
        <div role="status" className="alert alert--ok">
          <span style={{ flex: "none", color: "var(--ok-fg)", display: "flex" }}>
            <CheckCircleIcon />
          </span>
          <span style={{ flex: 1 }}>
            <b>ชำระเงินสำเร็จ</b> — {paid.titles.join(", ")} ถูกเพิ่มเข้าคลังเกมแล้ว คำสั่งซื้อ {paid.id}{" "}
            ยอดรวม ฿{paid.total.toLocaleString()} สถานะ FULFILLED
          </span>
          <button
            type="button"
            onClick={() => setBannerClosed(true)}
            aria-label="ปิดข้อความ"
            style={{
              width: 40,
              height: 40,
              border: "none",
              background: "transparent",
              color: "var(--text)",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="row row--between row--end">
        <div>
          <h1 className="page-title">คลังเกมของฉัน</h1>
          <p className="muted" style={{ margin: 0 }}>
            {owned.length === 0
              ? "ยังไม่มีเกมในคลัง"
              : `เป็นเจ้าของ ${owned.length} เกม · สิทธิ์การใช้งานผูกกับบัญชีของคุณ`}
          </p>
        </div>
        {owned.length > 0 && (
          <div role="search" style={{ flex: "0 1 320px" }}>
            <label htmlFor="lib-search" className="sr-only">
              ค้นหาในคลังเกม
            </label>
            <input
              id="lib-search"
              type="search"
              placeholder="ค้นหาในคลังเกม"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ---------- ยังไม่มีเกมในคลัง ---------- */}
      {owned.length === 0 || !current ? (
        <div
          className="card card--pad"
          style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}
        >
          <p className="dim" style={{ margin: 0 }}>
            เมื่อคุณซื้อเกมจากร้านค้า เกมจะเข้ามาอยู่ที่นี่พร้อม License Key และลิงก์ดาวน์โหลด
          </p>
          <Link to="/" className="btn btn--primary">
            ไปเลือกเกมจากร้านค้า
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          {/* ---------- รายการเกม ---------- */}
          <ul
            aria-label="รายการเกมในคลัง"
            className="card"
            style={{
              flex: "1 1 320px",
              listStyle: "none",
              margin: 0,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {list.length === 0 && (
              <li className="muted" style={{ padding: 16 }}>
                ไม่พบเกมที่ค้นหา
              </li>
            )}
            {list.map(({ entry, game }) => {
              const index = owned.findIndex((x) => x.entry.gameId === entry.gameId);
              const active = index === sel;
              return (
                <li key={entry.gameId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSel(index);
                      setShowKey(false);
                    }}
                    aria-pressed={active}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: 10,
                      borderRadius: 10,
                      border: `1px solid ${active ? "var(--accent)" : "transparent"}`,
                      background: active ? "var(--surface-input)" : "transparent",
                      color: "var(--text)",
                      font: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                      height: "auto",
                    }}
                  >
                    <span
                      style={{
                        width: 72,
                        height: 46,
                        flex: "none",
                        borderRadius: 6,
                        background: game.color,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span
                          style={{
                            position: "absolute",
                            right: 8,
                            top: 6,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: game.accent,
                          }}
                        />
                      )}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{game.title}</span>
                      <span className="muted" style={{ fontSize: 13 }}>
                        {entry.downloadCount === 0
                          ? "ใหม่ · ยังไม่ดาวน์โหลด"
                          : `ดาวน์โหลดแล้ว ${entry.downloadCount} ครั้ง`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ---------- รายละเอียดเกมที่เลือก ---------- */}
          <section
            aria-label="รายละเอียดเกมที่เลือก"
            className="card"
            style={{ flex: "999 1 540px", minWidth: 0, overflow: "hidden" }}
          >
            <div
              style={{ height: 220, position: "relative", overflow: "hidden", background: current.game.color }}
            >
              {current.game.coverUrl ? (
                <img
                  src={current.game.coverUrl}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <svg
                  viewBox="0 0 800 220"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                >
                  <circle cx="620" cy="70" r="90" fill={current.game.accent} opacity="0.8" />
                  <path d="M0 170 L160 110 L300 150 L460 90 L620 150 L800 120 L800 220 L0 220Z" fill="#000" opacity="0.3" />
                </svg>
              )}
              <h2
                style={{
                  position: "absolute",
                  left: 28,
                  bottom: 18,
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {current.game.title}
              </h2>
            </div>

            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="row" style={{ gap: 12 }}>
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  onClick={() => shop.markDownloaded(current.entry.gameId)}
                >
                  <DownloadIcon />
                  ดาวน์โหลด ({current.game.sizeMB} MB)
                </button>
                <Link to={`/games/${current.game.slug}`} className="btn btn--secondary btn--lg">
                  เขียนรีวิว
                </Link>
                <span className="muted" style={{ fontSize: 13 }}>
                  {current.entry.downloadCount > 0
                    ? `ดาวน์โหลดไปแล้ว ${current.entry.downloadCount} ครั้ง · ลิงก์หมดอายุใน 5 นาที`
                    : "ลิงก์ดาวน์โหลดหมดอายุใน 5 นาที (Pre-signed URL)"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="muted" style={{ fontSize: 14 }}>
                  License Key
                </span>
                <div className="row" style={{ gap: 10 }}>
                  <code
                    className="mono"
                    style={{
                      flex: "1 1 260px",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "var(--bg)",
                      border: "1px dashed var(--border-strong)",
                      fontSize: 18,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {showKey
                      ? current.entry.licenseKey
                      : `${current.entry.licenseKey.slice(0, 4)}••••-••••-${current.entry.licenseKey.slice(-4)}`}
                  </code>
                  <button type="button" className="btn btn--secondary" onClick={() => setShowKey((v) => !v)}>
                    {showKey ? "ซ่อน" : "แสดง"}
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={copyKey}>
                    {copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
                  </button>
                </div>
              </div>

              <dl
                style={{
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["วันที่ได้รับสิทธิ์", current.entry.acquiredAt],
                  ["คำสั่งซื้อ", current.entry.orderId],
                  ["ราคาที่ซื้อ", `฿${current.entry.pricePaid.toLocaleString()}`],
                  ["ผู้พัฒนา", current.game.dev],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "var(--surface-input)", borderRadius: 10, padding: "12px 16px" }}>
                    <dt className="muted" style={{ fontSize: 13 }}>
                      {label}
                    </dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      )}

      {/* ---------- ประวัติการสั่งซื้อ ---------- */}
      <section aria-labelledby="orders-title" className="stack" style={{ gap: 12 }}>
        <h2 id="orders-title" className="section-title">
          ประวัติการสั่งซื้อ
        </h2>
        {shop.orders.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            ยังไม่มีคำสั่งซื้อ
          </p>
        ) : (
          <div className="table-wrap">
            <table style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th scope="col">เลขที่คำสั่งซื้อ</th>
                  <th scope="col">วันที่</th>
                  <th scope="col">รายการ</th>
                  <th scope="col" className="num">
                    ยอดรวม
                  </th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {shop.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td>{o.date}</td>
                    <td>{o.items}</td>
                    <td className="num">{o.total}</td>
                    <td>
                      <span className={`pill ${ORDER_STATUS[o.status].tone}`}>
                        {ORDER_STATUS[o.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
