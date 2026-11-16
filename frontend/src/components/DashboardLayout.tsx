import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { LogoMark } from "./icons";
import { SOON } from "../lib/soon";

export interface SidebarItem {
  label: string;
  icon: ReactNode;
  /** id ของส่วนในหน้านี้ที่จะเลื่อนไปเมื่อคลิก */
  target: string;
  badge?: number | string;
  /** เมนูที่ยังไม่เปิดใช้ — แสดงไว้แต่กดไม่ได้ */
  soon?: boolean;
}

interface DashboardLayoutProps {
  console: string;
  items: SidebarItem[];
  activeIndex?: number;
  /** กล่องข้อมูลบัญชีที่ก้นแถบข้าง */
  account: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({
  console: consoleName,
  items,
  activeIndex = 0,
  account,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="dash">
      <aside className="sidebar">
        <Link to="/" className="brand" style={{ padding: "0 8px" }}>
          <LogoMark />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="brand__name" style={{ fontSize: 17 }}>
              HAFTSTAR
            </span>
            <span className="muted" style={{ fontSize: 12 }}>
              {consoleName}
            </span>
          </span>
        </Link>

        <nav aria-label="เมนูแดชบอร์ด" className="sidebar__nav">
          <Link to="/" className="sidebar__link" style={{ color: "var(--text-muted)" }}>
            ← กลับหน้าร้านค้า
          </Link>
          {items.map((item, i) =>
            item.soon ? (
              <span key={item.label} className="sidebar__link is-soon" aria-disabled="true" title={SOON}>
                <span style={{ flex: "none", display: "flex" }}>{item.icon}</span>
                <span className="grow">{item.label}</span>
                <span className="soon-badge">เร็ว ๆ นี้</span>
              </span>
            ) : (
              <a
                key={item.label}
                href={`#${item.target}`}
                aria-current={i === activeIndex ? "page" : undefined}
                className={i === activeIndex ? "sidebar__link is-active" : "sidebar__link"}
              >
                <span style={{ flex: "none", display: "flex" }}>{item.icon}</span>
                <span className="grow">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: "0 6px",
                      borderRadius: 11,
                      background: i === activeIndex ? "var(--accent-ink)" : "var(--surface-input)",
                      color: i === activeIndex ? "var(--accent)" : "var(--text)",
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: "22px",
                      textAlign: "center",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            )
          )}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {account}
          <Link to="/login" className="sidebar__link" style={{ color: "var(--text-muted)" }}>
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      <main className="dash__main">{children}</main>
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  deltaTone = "var(--ok-fg)",
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: string;
}) {
  return (
    <div className="kpi">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      <span className="kpi__delta" style={{ color: deltaTone }}>
        {delta}
      </span>
    </div>
  );
}
