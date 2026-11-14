import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { LogoMark } from "./icons";

function BrandArt() {
  return (
    <svg
      viewBox="0 0 622 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ width: "100%", height: 260, borderRadius: 14, display: "block" }}
    >
      <rect width="622" height="300" fill="#13254A" />
      <circle cx="456" cy="110" r="92" fill="#FFFFFF" opacity="0.12" />
      <circle cx="456" cy="110" r="46" fill="#FFA94D" opacity="0.75" />
      <path d="M0 180 L90 130 L180 165 L280 110 L380 165 L480 125 L622 160 L622 300 L0 300Z" fill="#0A1324" opacity="0.55" />
      <path d="M0 230 L120 200 L250 225 L380 190 L500 220 L622 200 L622 300 L0 300Z" fill="#0A1324" />
      <circle cx="87" cy="102" r="12" fill="#C8F04A" opacity="0.9" />
      <circle cx="204" cy="58" r="8" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

interface AuthShellProps {
  /** ข้อความมุมขวาบนของแถบนำทาง */
  altPrompt: string;
  altLabel: string;
  altTo: string;
  /** แผงซ้าย */
  heading: string;
  subheading: string;
  aside: ReactNode;
  /** ฟอร์มด้านขวา */
  children: ReactNode;
}

export default function AuthShell({
  altPrompt,
  altLabel,
  altTo,
  heading,
  subheading,
  aside,
  children,
}: AuthShellProps) {
  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="shell navbar__inner" style={{ paddingBlock: 24 }}>
          <Link to="/" className="brand">
            <LogoMark />
            <span className="brand__name">HAFTSTAR GAME</span>
          </Link>
          <Link to="/" className="nav-link" style={{ color: "var(--text-muted)" }}>
            ← กลับไปหน้าร้านค้า
          </Link>
          <span className="grow" />
          <span className="muted">{altPrompt}</span>
          <Link to={altTo} className="btn btn--secondary">
            {altLabel}
          </Link>
        </div>
      </header>

      <div className="auth" style={{ flex: 1, minHeight: 0 }}>
        <aside className="auth__aside">
          <BrandArt />
          <h2 style={{ fontSize: 38, fontWeight: 700, textShadow: "0 0 18px rgba(255,255,255,0.25)" }}>
            {heading}
          </h2>
          <p className="dim" style={{ margin: 0, fontSize: 17 }}>
            {subheading}
          </p>
          {aside}
        </aside>

        <div className="auth__panel">
          <div className="auth__card card card--pad">{children}</div>
        </div>
      </div>
    </div>
  );
}
