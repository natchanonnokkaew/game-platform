import { Link, Route, Routes } from "react-router-dom";
import StorePage from "./pages/StorePage";
import LoginPage from "./pages/LoginPage";
import LibraryPage from "./pages/LibraryPage";

export default function App() {
  return (
    <div className="app">
      <header className="nav">
        <Link to="/" className="brand">
          Game Platform
        </Link>
        <nav>
          <Link to="/">ร้านค้า</Link>
          <Link to="/library">คลังเกม</Link>
          <Link to="/login">เข้าสู่ระบบ</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="*" element={<p>ไม่พบหน้านี้</p>} />
        </Routes>
      </main>
    </div>
  );
}
