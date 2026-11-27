import { Link, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import { ShopProvider } from "./store/shop";
import { AuthProvider, RequireAuth } from "./store/auth";

import StorePage from "./pages/StorePage";
import GameDetailPage from "./pages/GameDetailPage";
import LibraryPage from "./pages/LibraryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DevDashboardPage from "./pages/DevDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function NotFound() {
  return (
    <div className="stack" style={{ gap: 12 }}>
      <h1 className="page-title">ไม่พบหน้านี้</h1>
      <p className="muted" style={{ margin: 0 }}>
        ลิงก์อาจเปลี่ยนไปแล้ว หรือพิมพ์ที่อยู่ไม่ถูกต้อง
      </p>
      <Link to="/" className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
        กลับไปหน้าร้านค้า
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <ShopProvider>
      <Routes>
        {/* หน้าที่มีแถบนำทางหลัก */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<StorePage />} />
          <Route path="/games/:slug" element={<GameDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/checkout/success" element={<RequireAuth><OrderSuccessPage /></RequireAuth>} />
          <Route path="/library" element={<RequireAuth><LibraryPage /></RequireAuth>} />
          {/*
            ยังไม่เปิดใช้ในขอบเขต 30% — ไฟล์หน้าเก็บไว้แล้ว เปิดใช้ภายหลังโดยเพิ่ม Route กลับ:
            /community (CommunityPage), /profile (ProfilePage), /profile/edit (EditProfilePage), /wishlist (WishlistPage)
          */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* หน้าเข้าสู่ระบบ — เต็มจอ ไม่มีแถบนำทางหลัก */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* แดชบอร์ด — ใช้แถบข้างแทน */}
        <Route path="/developer" element={<RequireAuth roles={["DEVELOPER"]}><DevDashboardPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth roles={["ADMIN"]}><AdminDashboardPage /></RequireAuth>} />
      </Routes>
    </ShopProvider>
    </AuthProvider>
  );
}
