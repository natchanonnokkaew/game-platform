import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import DashboardLayout, { Kpi, type SidebarItem } from "../components/DashboardLayout";
import GameReviewModal, { canApprove, MAX_FILE_MB, reviewChecklist } from "../components/GameReviewModal";
import { ORDER_STATUS, type Game, type OrderStatus, type Role } from "../data/mock";
import { ChartIcon, GamepadIcon, ReceiptIcon, ShieldIcon, StarIcon, TagIcon, UsersIcon } from "../components/icons";
import { useShop } from "../store/shop";

const ROLE_LABEL: Record<Role, { text: string; tone: string }> = {
  PLAYER: { text: "ผู้เล่น", tone: "pill--info" },
  DEVELOPER: { text: "ผู้พัฒนา", tone: "pill--accent" },
  ADMIN: { text: "แอดมิน", tone: "pill--warn" },
};

const ORDER_FILTERS: ("ALL" | OrderStatus)[] = ["ALL", "PAID", "PENDING", "FULFILLED", "REFUNDED", "CANCELLED"];

const baht = (n: number) => `฿${n.toLocaleString()}`;

export default function AdminDashboardPage() {
  const shop = useShop();

  /* ข้อความแจ้งผลการทำงานล่าสุด (หายเองใน 4 วินาที) */
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const [reviewing, setReviewing] = useState<Game | null>(null);
  const [unlisting, setUnlisting] = useState<{ id: string; note: string } | null>(null);
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [userQuery, setUserQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [refunding, setRefunding] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const queue = shop.pendingGames;
  const published = shop.games.filter((g) => g.status === "APPROVED");

  /* ---------- ตัวเลขภาพรวม (คำนวณจากข้อมูลจริงในระบบ) ---------- */
  const roleCount = (r: Role) => shop.users.filter((u) => u.role === r).length;
  const suspendedCount = shop.users.filter((u) => u.status === "SUSPENDED").length;
  const needAction = shop.orders.filter((o) => o.status === "PAID" || o.status === "PENDING").length;

  /* ---------- ผู้ใช้ ---------- */
  const users = shop.users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    const q = userQuery.trim().toLowerCase();
    return !q || `${u.name} ${u.email}`.toLowerCase().includes(q);
  });

  /* ---------- คำสั่งซื้อ ---------- */
  const orders = orderFilter === "ALL" ? shop.orders : shop.orders.filter((o) => o.status === orderFilter);
  const orderCount = (f: "ALL" | OrderStatus) =>
    f === "ALL" ? shop.orders.length : shop.orders.filter((o) => o.status === f).length;

  /* ---------- หมวดหมู่ ---------- */
  const categories = useMemo(
    () =>
      shop.categories.map((name) => ({
        name,
        count: shop.games.filter((g) => g.genre === name && g.status !== "REJECTED").length,
        used: shop.games.some((g) => g.genre === name),
      })),
    [shop.categories, shop.games]
  );

  /* ---------- รายงาน ---------- */
  const report = useMemo(() => {
    const byGenre: Record<string, number> = {};
    for (const g of published) byGenre[g.genre] = (byGenre[g.genre] ?? 0) + g.unitsSold * g.price;
    const genres = Object.entries(byGenre).sort((a, b) => b[1] - a[1]);
    const top = [...published].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
    const gross = genres.reduce((s, [, v]) => s + v, 0);
    return { genres, top, gross, maxGenre: genres[0]?.[1] ?? 1, maxUnits: top[0]?.unitsSold ?? 1 };
  }, [published]);

  const sidebar: SidebarItem[] = [
    { label: "ภาพรวม", icon: <ChartIcon />, target: "overview" },
    { label: "อนุมัติเกม", icon: <GamepadIcon />, target: "queue", badge: queue.length || undefined },
    { label: "เกมที่เผยแพร่", icon: <StarIcon />, target: "published" },
    { label: "ผู้ใช้และผู้พัฒนา", icon: <UsersIcon />, target: "users", badge: shop.devRequests.length || undefined },
    { label: "คำสั่งซื้อและการชำระเงิน", icon: <ReceiptIcon />, target: "orders", badge: needAction || undefined },
    { label: "หมวดหมู่เกม", icon: <TagIcon />, target: "categories" },
    { label: "รายงานแพลตฟอร์ม", icon: <ShieldIcon />, target: "report" },
  ];

  function approve(g: Game) {
    shop.approveGame(g.id);
    setReviewing(null);
    setToast(`อนุมัติ “${g.title}” แล้ว · ขึ้นหน้าร้านค้าเรียบร้อย`);
  }

  function reject(g: Game, note: string) {
    shop.rejectGame(g.id, note);
    setReviewing(null);
    setToast(`ปฏิเสธ “${g.title}” แล้ว · ผู้พัฒนาจะเห็นเหตุผลในแดชบอร์ด`);
  }

  function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return setCategoryError("กรุณากรอกชื่อหมวดหมู่");
    if (!shop.addCategory(name)) return setCategoryError(`มีหมวด “${name}” อยู่แล้ว`);
    setNewCategory("");
    setCategoryError(null);
    setToast(`เพิ่มหมวด “${name}” แล้ว · ใช้ได้ทันทีในหน้าร้านและฟอร์มอัปโหลดของผู้พัฒนา`);
  }

  return (
    <DashboardLayout
      console="Admin Console"
      items={sidebar}
      activeIndex={0}
      account={
        <div className="panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            เข้าสู่ระบบในฐานะ
          </span>
          <span style={{ fontSize: 14 }}>admin.haftstar</span>
          <span className="pill pill--warn" style={{ alignSelf: "flex-start" }}>
            ADMIN
          </span>
        </div>
      }
    >
      <div id="overview">
        <h1 className="page-title">ภาพรวมแพลตฟอร์ม</h1>
        <p className="muted" style={{ margin: 0 }}>
          ทุกตัวเลขคำนวณจากข้อมูลในระบบ และเปลี่ยนตามการทำงานของผู้เล่นกับผู้พัฒนาทันที
        </p>
      </div>

      <div className="kpi-grid">
        <Kpi
          label="ผู้ใช้ทั้งหมด"
          value={`${shop.users.length} บัญชี`}
          delta={`ผู้เล่น ${roleCount("PLAYER")} · ผู้พัฒนา ${roleCount("DEVELOPER")} · แอดมิน ${roleCount("ADMIN")}${suspendedCount ? ` · ระงับ ${suspendedCount}` : ""}`}
          deltaTone="var(--text-muted)"
        />
        <Kpi
          label="เกมรอตรวจสอบ"
          value={`${queue.length} เกม`}
          delta={`เผยแพร่แล้ว ${shop.approvedGames.length} เกม`}
          deltaTone={queue.length ? "var(--warn-fg)" : "var(--text-muted)"}
        />
        <Kpi
          label="ยอดขายสะสมทั้งแพลตฟอร์ม"
          value={baht(report.gross)}
          delta={`คำสั่งซื้อในระบบ ${shop.orders.length} · รอดำเนินการ ${needAction}`}
          deltaTone={needAction ? "var(--warn-fg)" : "var(--text-muted)"}
        />
        <Kpi
          label="คำขอเปิดบัญชีผู้พัฒนา"
          value={`${shop.devRequests.length} ราย`}
          delta={shop.devRequests.length ? "รอการอนุมัติ" : "ไม่มีคำขอค้าง"}
          deltaTone="var(--text-muted)"
        />
      </div>

      {/* ---------- คิวตรวจสอบเกม ---------- */}
      <section id="queue" className="stack" style={{ gap: 12 }}>
        <div>
          <h2 className="section-title">คิวตรวจสอบและอนุมัติเกม</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            เกมจากแดชบอร์ดผู้พัฒนาจะเข้ามาที่นี่ ตรวจไฟล์ (≤{MAX_FILE_MB} MB) เนื้อหา และราคา ก่อนเผยแพร่
          </p>
        </div>

        {queue.length === 0 ? (
          <p className="card card--pad muted" style={{ margin: 0 }}>
            ไม่มีเกมรอตรวจสอบในขณะนี้ — เมื่อผู้พัฒนาส่งเกมหรือแก้ไขเกมที่ถูกปฏิเสธ เกมจะขึ้นที่นี่
          </p>
        ) : (
          queue.map((q) => {
            const devSuspended = shop.isSuspended(q.dev);
            const checks = reviewChecklist(q, devSuspended);
            const blocking = checks.filter((c) => c.required && !c.ok);
            return (
              <div key={q.id} className="card card--pad">
                <div className="row row--between" style={{ gap: 16 }}>
                  <div className="row" style={{ gap: 14, flexWrap: "nowrap", minWidth: 0 }}>
                    <span style={{ width: 96, height: 60, flex: "none", borderRadius: 8, background: q.color, overflow: "hidden" }}>
                      {q.coverUrl && <img src={q.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: 2 }}>
                      <b>{q.title}</b>
                      <span className="muted" style={{ fontSize: 13 }}>
                        {q.dev} · {q.genre} · {baht(q.price)} · {q.sizeMB > 0 ? `ไฟล์ ${q.sizeMB} MB` : "ยังไม่มีไฟล์"} · ส่งเมื่อ{" "}
                        {q.submittedAt}
                      </span>
                      {blocking.map((c) => (
                        <span key={c.label} style={{ fontSize: 13, color: "var(--danger-fg)" }}>
                          ✕ {c.label}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => setReviewing(q)}>
                      ตรวจสอบรายละเอียด
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={!canApprove(checks)}
                      title={blocking.length ? "ต้องผ่านเงื่อนไขที่จำเป็นก่อน" : undefined}
                      onClick={() => approve(q)}
                    >
                      อนุมัติ
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ---------- เกมที่เผยแพร่ ---------- */}
      <section id="published" className="stack" style={{ gap: 12 }}>
        <div>
          <h2 className="section-title">เกมที่เผยแพร่บนร้านค้า</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            นำเกมออกจากร้านได้ — เกมจะกลับไปที่ผู้พัฒนาพร้อมเหตุผล ผู้ที่ซื้อแล้วยังมีเกมในคลังตามเดิม
          </p>
        </div>
        <div className="table-wrap">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th scope="col">เกม</th>
                <th scope="col">ผู้พัฒนา</th>
                <th scope="col" className="num">ราคา</th>
                <th scope="col" className="num">ขายได้</th>
                <th scope="col" className="num">รายได้</th>
                <th scope="col">สถานะ</th>
                <th scope="col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {published.map((g) => {
                const hidden = shop.isSuspended(g.dev);
                return (
                  <tr key={g.id}>
                    <td>
                      {hidden ? (
                        <b>{g.title}</b>
                      ) : (
                        <Link to={`/games/${g.slug}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                          {g.title}
                        </Link>
                      )}
                      <div className="muted" style={{ fontSize: 13 }}>
                        {g.genre}
                      </div>
                    </td>
                    <td>{g.dev}</td>
                    <td className="num">{baht(g.price)}</td>
                    <td className="num">{g.unitsSold.toLocaleString()}</td>
                    <td className="num">{baht(g.unitsSold * g.price)}</td>
                    <td>
                      <span className={hidden ? "pill pill--warn" : "pill pill--ok"}>
                        {hidden ? "ซ่อน · ผู้พัฒนาถูกระงับ" : "ขายอยู่"}
                      </span>
                    </td>
                    <td>
                      {unlisting?.id === g.id ? (
                        <form
                          className="row"
                          style={{ gap: 6, flexWrap: "nowrap" }}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const note = unlisting.note.trim() || "ไม่ระบุเหตุผล";
                            shop.rejectGame(g.id, `นำออกจากร้านโดยผู้ดูแลระบบ: ${note}`);
                            setUnlisting(null);
                            setToast(`นำ “${g.title}” ออกจากร้านแล้ว · ส่งกลับให้ ${g.dev} แก้ไข`);
                          }}
                        >
                          <input
                            aria-label={`เหตุผลที่นำ ${g.title} ออก`}
                            placeholder="เหตุผล"
                            value={unlisting.note}
                            onChange={(e) => setUnlisting({ id: g.id, note: e.target.value })}
                            style={{ height: 40, minWidth: 140 }}
                            autoFocus
                          />
                          <button type="submit" className="btn btn--danger btn--sm">
                            ยืนยัน
                          </button>
                          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setUnlisting(null)}>
                            ยกเลิก
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => setUnlisting({ id: g.id, note: "" })}
                        >
                          นำออกจากร้าน
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- ผู้ใช้และผู้พัฒนา ---------- */}
      <section id="users" className="stack" style={{ gap: 16 }}>
        <h2 className="section-title">ผู้ใช้และผู้พัฒนา</h2>

        <div className="card card--pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>คำขอเปิดบัญชีผู้พัฒนา</h3>
          {shop.devRequests.length === 0 ? (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              ไม่มีคำขอค้าง
            </p>
          ) : (
            shop.devRequests.map((d) => (
              <div key={d.id} className="row row--between" style={{ gap: 12 }}>
                <span className="row" style={{ gap: 12, flexWrap: "nowrap", minWidth: 0 }}>
                  <span className="avatar" style={{ background: "var(--surface-input)", boxShadow: "none" }}>
                    {d.initial}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      {d.name} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>· {d.email}</span>
                    </span>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {d.note} · ส่งคำขอ {d.sent}
                    </span>
                  </span>
                </span>
                <span className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => {
                      shop.rejectDevRequest(d.id);
                      setToast(`ปฏิเสธคำขอของ ${d.name} แล้ว`);
                    }}
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      shop.approveDevRequest(d.id);
                      setToast(`อนุมัติ ${d.name} เป็นผู้พัฒนาแล้ว · เพิ่มเข้ารายชื่อผู้ใช้`);
                    }}
                  >
                    อนุมัติ
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="row row--between" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            {(["ALL", "PLAYER", "DEVELOPER", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={roleFilter === r ? "chip is-active" : "chip"}
                aria-pressed={roleFilter === r}
                onClick={() => setRoleFilter(r)}
              >
                {r === "ALL" ? "ทั้งหมด" : ROLE_LABEL[r].text}
                <span className="chip__count">{r === "ALL" ? shop.users.length : roleCount(r)}</span>
              </button>
            ))}
          </div>
          <label htmlFor="user-search" className="sr-only">
            ค้นหาผู้ใช้
          </label>
          <input
            id="user-search"
            type="search"
            placeholder="ค้นหาชื่อหรืออีเมล"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>

        <div className="table-wrap">
          <table style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th scope="col">ชื่อผู้ใช้</th>
                <th scope="col">อีเมล</th>
                <th scope="col">บทบาท</th>
                <th scope="col">ข้อมูลในระบบ</th>
                <th scope="col">สถานะ</th>
                <th scope="col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const suspended = u.status === "SUSPENDED";
                const info =
                  u.role === "DEVELOPER"
                    ? `${shop.gamesByDev(u.name).length} เกม`
                    : u.role === "PLAYER"
                      ? `${shop.orders.filter((o) => o.buyer === u.name).length} คำสั่งซื้อ`
                      : "—";
                return (
                  <tr key={u.id}>
                    <td>
                      <b>{u.name}</b>
                      <div className="muted" style={{ fontSize: 13 }}>
                        เข้าร่วม {u.joined}
                      </div>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <span className={`pill ${ROLE_LABEL[u.role].tone}`}>{ROLE_LABEL[u.role].text}</span>
                    </td>
                    <td>{info}</td>
                    <td>
                      <span className={suspended ? "pill pill--danger" : "pill pill--ok"}>{suspended ? "ถูกระงับ" : "ปกติ"}</span>
                    </td>
                    <td>
                      {u.role === "ADMIN" ? (
                        <span className="muted">—</span>
                      ) : (
                        <button
                          type="button"
                          className={suspended ? "btn btn--secondary btn--sm" : "btn btn--danger btn--sm"}
                          onClick={() => {
                            shop.setUserStatus(u.id, suspended ? "ACTIVE" : "SUSPENDED");
                            setToast(
                              suspended
                                ? `ยกเลิกการระงับ ${u.name} แล้ว`
                                : u.role === "DEVELOPER"
                                  ? `ระงับ ${u.name} แล้ว · เกมของผู้พัฒนานี้ถูกซ่อนจากหน้าร้าน`
                                  : `ระงับ ${u.name} แล้ว · ผู้ใช้นี้ซื้อเกมไม่ได้จนกว่าจะยกเลิก`
                            );
                          }}
                        >
                          {suspended ? "ยกเลิกระงับ" : "ระงับบัญชี"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- คำสั่งซื้อ ---------- */}
      <section id="orders" className="stack" style={{ gap: 12 }}>
        <div>
          <h2 className="section-title">คำสั่งซื้อและการชำระเงิน</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            คำสั่งซื้อจากหน้าชำระเงินขึ้นที่นี่ทันที · คืนเงินแล้วสิทธิ์ (License Key) ในคลังเกมของผู้ซื้อจะถูกเพิกถอน
          </p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          {ORDER_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={orderFilter === f ? "chip is-active" : "chip"}
              aria-pressed={orderFilter === f}
              onClick={() => setOrderFilter(f)}
            >
              {f === "ALL" ? "ทั้งหมด" : f}
              <span className="chip__count">{orderCount(f)}</span>
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table style={{ minWidth: 1100 }}>
            <thead>
              <tr>
                <th scope="col">คำสั่งซื้อ</th>
                <th scope="col">วันที่</th>
                <th scope="col">ผู้ซื้อ</th>
                <th scope="col">รายการ</th>
                <th scope="col" className="num">ยอดรวม</th>
                <th scope="col">สถานะ</th>
                <th scope="col">อ้างอิง</th>
                <th scope="col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>{o.id}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.date}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.buyer}</td>
                  <td>{o.items}</td>
                  <td className="num">{baht(o.total)}</td>
                  <td>
                    <span className={`pill ${ORDER_STATUS[o.status].tone}`}>{o.status}</span>
                  </td>
                  <td className="mono muted">{o.ref}</td>
                  <td>
                    <span className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
                      {o.status === "PAID" && (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => {
                            shop.fulfillOrder(o.id);
                            setToast(`ส่งมอบสิทธิ์ ${o.id} แล้ว`);
                          }}
                        >
                          ส่งมอบสิทธิ์
                        </button>
                      )}
                      {o.status === "PENDING" && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => {
                            shop.cancelOrder(o.id);
                            setToast(`ยกเลิก ${o.id} แล้ว`);
                          }}
                        >
                          ยกเลิก
                        </button>
                      )}
                      {(o.status === "FULFILLED" || o.status === "PAID") &&
                        (refunding === o.id ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => {
                                shop.refundOrder(o.id);
                                setRefunding(null);
                                setToast(`คืนเงิน ${o.id} แล้ว · เพิกถอนสิทธิ์ในคลังเกมของ ${o.buyer}`);
                              }}
                            >
                              ยืนยันคืนเงิน {baht(o.total)}
                            </button>
                            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setRefunding(null)}>
                              ไม่ใช่
                            </button>
                          </>
                        ) : (
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => setRefunding(o.id)}>
                            คืนเงิน
                          </button>
                        ))}
                      {(o.status === "REFUNDED" || o.status === "CANCELLED") && <span className="muted">—</span>}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    ไม่มีคำสั่งซื้อในสถานะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        {/* ---------- หมวดหมู่เกม ---------- */}
        <section
          id="categories"
          className="card card--pad"
          style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>หมวดหมู่เกม</h2>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              ใช้ในชิปกรองหน้าร้านค้า และตัวเลือกประเภทตอนผู้พัฒนาอัปโหลด/แก้ไขเกม · ลบได้เฉพาะหมวดที่ไม่มีเกมใช้
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {categories.map((c) => (
              <span key={c.name} className="tag" style={{ padding: "6px 6px 6px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {c.name} · {c.count}
                <button
                  type="button"
                  aria-label={`ลบหมวด ${c.name}`}
                  title={c.used ? "มีเกมใช้หมวดนี้อยู่ ลบไม่ได้" : "ลบหมวดนี้"}
                  disabled={c.used}
                  onClick={() => {
                    if (shop.removeCategory(c.name)) setToast(`ลบหมวด “${c.name}” แล้ว`);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    border: "none",
                    background: "rgba(255,255,255,.08)",
                    color: c.used ? "var(--text-muted)" : "var(--danger-fg)",
                    cursor: c.used ? "not-allowed" : "pointer",
                    opacity: c.used ? 0.4 : 1,
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <form className="row" style={{ gap: 10, flexWrap: "nowrap" }} onSubmit={handleAddCategory}>
            <label htmlFor="new-cat" className="sr-only">
              ชื่อหมวดหมู่ใหม่
            </label>
            <input
              id="new-cat"
              placeholder="ชื่อหมวดหมู่ใหม่"
              value={newCategory}
              aria-invalid={categoryError ? true : undefined}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setCategoryError(null);
              }}
            />
            <button type="submit" className="btn btn--primary">
              เพิ่ม
            </button>
          </form>
          {categoryError && (
            <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
              {categoryError}
            </p>
          )}
        </section>

        {/* ---------- รายงานแพลตฟอร์ม ---------- */}
        <section
          id="report"
          className="card card--pad"
          style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>รายงานแพลตฟอร์ม</h2>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              ยอดขายสะสมของเกมที่เผยแพร่ {baht(report.gross)}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>รายได้ตามหมวดหมู่</h3>
            {report.genres.map(([name, value]) => (
              <div key={name} className="row" style={{ gap: 10, fontSize: 14, flexWrap: "nowrap" }}>
                <span style={{ width: 72, flex: "none" }}>{name}</span>
                <span style={{ flex: 1, height: 10, borderRadius: 5, background: "var(--surface-input)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${(value / report.maxGenre) * 100}%`, background: "#6EA8FF" }} />
                </span>
                <span className="muted" style={{ width: 90, textAlign: "right", flex: "none" }}>
                  {baht(value)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>เกมขายดี 5 อันดับ</h3>
            {report.top.map((g, i) => (
              <div key={g.id} className="row" style={{ gap: 10, fontSize: 14, flexWrap: "nowrap" }}>
                <span className="muted" style={{ width: 16, flex: "none" }}>
                  {i + 1}
                </span>
                <span style={{ width: 140, flex: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</span>
                <span style={{ flex: 1, height: 10, borderRadius: 5, background: "var(--surface-input)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${(g.unitsSold / report.maxUnits) * 100}%`, background: "var(--accent)" }} />
                </span>
                <span className="muted" style={{ width: 70, textAlign: "right", flex: "none" }}>
                  {g.unitsSold} ชุด
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {reviewing && (
        <GameReviewModal
          game={reviewing}
          devSuspended={shop.isSuspended(reviewing.dev)}
          onClose={() => setReviewing(null)}
          onApprove={() => approve(reviewing)}
          onReject={(note) => reject(reviewing, note)}
        />
      )}

      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
