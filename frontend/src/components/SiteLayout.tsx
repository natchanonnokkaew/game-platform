import { NavLink, Link, Outlet } from "react-router-dom";
import { CartIcon, HeartIcon, LogoMark, SearchIcon } from "./icons";
import { useCart } from "../store/cart";

const MENU = [
  { to: "/", label: "ร้านค้า", end: true },
  { to: "/library", label: "คลังเกม" },
  { to: "/community", label: "คอมมูนิตี้" },
  { to: "/profile", label: "โปรไฟล์" },
];

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
          <button type="button" className="icon-btn" aria-label="รายการที่ต้องการ">
            <HeartIcon />
          </button>
          <button type="button" className="icon-btn" aria-label={`ตะกร้าสินค้า ${count} รายการ`}>
            <CartIcon />
            {count > 0 && <span className="badge-count">{count}</span>}
          </button>
          <Link to="/profile" className="avatar" aria-label="โปรไฟล์ของฉัน">
            ณ
          </Link>
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
        <span>ชำระเงินผ่านระบบจำลอง · เชื่อมต่อผ่าน HTTPS</span>
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
