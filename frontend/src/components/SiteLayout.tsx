import { useEffect, useRef, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { CartIcon, HeartIcon, LogoMark, SearchIcon } from "./icons";
import { useCart } from "../store/cart";

const MENU = [
  { to: "/", label: "ร้านค้า", end: true },
  { to: "/library", label: "คลังเกม" },
  { to: "/community", label: "คอมมูนิตี้" },
  { to: "/profile", label: "โปรไฟล์" },
];

/** เมนูผู้ใช้ — ทางเข้าหน้าแดชบอร์ดและหน้าเข้าสู่ระบบ */
function UserMenu() {
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

  const items = [
    { to: "/profile", label: "โปรไฟล์ของฉัน" },
    { to: "/profile/edit", label: "แก้ไขโปรไฟล์" },
    { to: "/library", label: "คลังเกม" },
    { divider: true as const },
    { to: "/developer", label: "แดชบอร์ดผู้พัฒนา" },
    { to: "/admin", label: "แดชบอร์ดผู้ดูแลระบบ" },
    { divider: true as const },
    { to: "/login", label: "ออกจากระบบ" },
  ];

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="เมนูผู้ใช้"
        onClick={() => setOpen((v) => !v)}
        style={{ border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
      >
        ณ
      </button>

      {open && (
        <div role="menu" className="user-menu">
          {items.map((item, i) =>
            "divider" in item ? (
              <span key={`d${i}`} className="user-menu__divider" />
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
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { count } = useCart();

  return (
    <header className="navbar">
      <div className="shell navbar__inner">
        <Link to="/" className="brand">
          <LogoMark />
          <span className="brand__name">HAFTSTAR GAME</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="nav-links">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-search" role="search">
          <label htmlFor="global-search" className="sr-only">
            ค้นหาเกม
          </label>
          <SearchIcon />
          <input id="global-search" type="search" placeholder="ค้นหาเกม ผู้พัฒนา หรือแท็ก" />
        </div>

        <div className="nav-actions">
          <Link to="/wishlist" className="icon-btn" aria-label="รายการที่ต้องการ">
            <HeartIcon />
          </Link>
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
