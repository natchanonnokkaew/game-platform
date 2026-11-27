import { useEffect, useRef, useState } from "react";
import { NavLink, Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { CartIcon, HeartIcon, LogoMark, SearchIcon } from "./icons";
import { useShop } from "../store/shop";
import { SOON } from "../lib/soon";
import { useAuth } from "../store/auth";

const ROLE_LABEL = { PLAYER: "ผู้เล่น", DEVELOPER: "ผู้พัฒนาเกม", ADMIN: "ผู้ดูแลระบบ" } as const;

const MENU = [
  { to: "/", label: "ร้านค้า", end: true },
  { to: "/library", label: "คลังเกม" },
  { to: "/community", label: "คอมมูนิตี้", soon: true },
  { to: "/profile", label: "โปรไฟล์", soon: true },
];

/** เมนูผู้ใช้ — ทางเข้าหน้าแดชบอร์ดและหน้าเข้าสู่ระบบ */
function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) {
    return (
      <Link to="/login" className="btn btn--primary" style={{ whiteSpace: "nowrap" }}>
        เข้าสู่ระบบ
      </Link>
    );
  }

  // แสดงเฉพาะแดชบอร์ดที่บทบาทนี้เข้าได้ (backend ก็ตรวจซ้ำและตอบ 403)
  const items: ({ to: string; label: string; soon?: boolean } | { divider: true })[] = [
    { to: "/profile", label: "โปรไฟล์ของฉัน", soon: true },
    { to: "/profile/edit", label: "แก้ไขโปรไฟล์", soon: true },
    { to: "/library", label: "คลังเกม" },
    ...(user.role === "DEVELOPER" ? [{ divider: true as const }, { to: "/developer", label: "แดชบอร์ดผู้พัฒนา" }] : []),
    ...(user.role === "ADMIN" ? [{ divider: true as const }, { to: "/admin", label: "แดชบอร์ดผู้ดูแลระบบ" }] : []),
  ];

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`เมนูผู้ใช้ ${user.displayName}`}
        title={user.displayName}
        onClick={() => setOpen((v) => !v)}
        style={{ border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
      >
        {user.displayName.trim().charAt(0).toUpperCase() || "?"}
      </button>

      {open && (
        <div role="menu" className="user-menu">
          <div style={{ padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 15 }}>{user.displayName}</b>
            <span className="muted" style={{ fontSize: 13 }}>
              {user.email} · {ROLE_LABEL[user.role]}
            </span>
          </div>
          <span className="user-menu__divider" />
          {items.map((item, i) =>
            "divider" in item ? (
              <span key={`d${i}`} className="user-menu__divider" />
            ) : item.soon ? (
              <span
                key={item.to}
                role="menuitem"
                aria-disabled="true"
                title={SOON}
                className="user-menu__item is-soon"
              >
                {item.label}
                <span className="soon-badge">เร็ว ๆ นี้</span>
              </span>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                className="user-menu__item"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(item.to);
                }}
              >
                {item.label}
              </Link>
            )
          )}
          <span className="user-menu__divider" />
          <button
            type="button"
            role="menuitem"
            className="user-menu__item"
            style={{ width: "100%", border: "none", background: "transparent", font: "inherit", cursor: "pointer", textAlign: "left" }}
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/");
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}

/** ช่องค้นหาหลัก — ส่งคำค้นไปหน้าร้านค้าผ่าน query string */
function GlobalSearch() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const navigate = useNavigate();

  return (
    <form
      className="nav-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
      }}
    >
      <label htmlFor="global-search" className="sr-only">
        ค้นหาเกม
      </label>
      <SearchIcon />
      <input
        id="global-search"
        type="search"
        placeholder="ค้นหาเกม ผู้พัฒนา หรือแท็ก"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}

export function Navbar() {
  const { count } = useShop();

  return (
    <header className="navbar">
      <div className="shell navbar__inner">
        <Link to="/" className="brand">
          <LogoMark />
          <span className="brand__name">HAFTSTAR GAME</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="nav-links">
          {MENU.map((item) =>
            item.soon ? (
              <span key={item.to} className="nav-link is-soon" aria-disabled="true" title={SOON}>
                {item.label}
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <GlobalSearch />

        <div className="nav-actions">
          <button type="button" className="icon-btn is-soon" aria-disabled="true" aria-label={`รายการที่ต้องการ (${SOON})`} title={`Wishlist · ${SOON}`}>
            <HeartIcon />
          </button>
          <Link to="/cart" className="icon-btn" aria-label={`ตะกร้าสินค้า ${count} รายการ`}>
            <CartIcon />
            {count > 0 && <span className="badge-count">{count}</span>}
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-nav)" }}>
      <div
        className="shell"
        style={{
          paddingBlock: 28,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        <span>© 2569 HAFTSTAR GAME · ระบบแพลตฟอร์มจำหน่ายและจัดการเกมดิจิทัล</span>
        <nav aria-label="ลิงก์ท้ายหน้า" className="row" style={{ gap: 16 }}>
          <Link to="/developer" style={{ color: "var(--text-muted)" }}>
            สำหรับผู้พัฒนา
          </Link>
          <Link to="/admin" style={{ color: "var(--text-muted)" }}>
            ผู้ดูแลระบบ
          </Link>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            เข้าสู่ระบบ
          </Link>
          <span>ชำระเงินผ่านระบบจำลอง · เชื่อมต่อผ่าน HTTPS</span>
        </nav>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="shell page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
