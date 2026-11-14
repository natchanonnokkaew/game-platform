import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OrderRow } from "../data/mock";

export interface PaidOrder {
  id: string;
  titles: string[];
  total: number;
}

interface ShopValue {
  /* ตะกร้าสินค้า */
  items: string[];
  count: number;
  has: (gameId: string) => boolean;
  toggle: (gameId: string) => void;
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  clear: () => void;

  /* รายการที่ต้องการ (Wishlist) */
  wishlist: string[];
  inWishlist: (gameId: string) => boolean;
  toggleWishlist: (gameId: string) => void;
  removeWishlist: (gameId: string) => void;

  /* เกมที่ซื้อในเซสชันนี้ + คำสั่งซื้อที่เกิดขึ้น */
  purchased: string[];
  newOrders: OrderRow[];
  checkout: (gameIds: string[], titles: string[], total: number) => PaidOrder;
}

const ShopContext = createContext<ShopValue | null>(null);

let orderSeq = 24118;

/**
 * ตะกร้า Wishlist และคำสั่งซื้อ — เก็บในหน่วยความจำของเบราว์เซอร์
 * เมื่อต่อ backend แล้วให้เปลี่ยนไปเรียก /api/cart, /api/wishlist และ /api/orders/checkout
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [newOrders, setNewOrders] = useState<OrderRow[]>([]);

  const has = useCallback((id: string) => items.includes(id), [items]);
  const add = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x !== id));
  }, []);
  const toggle = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const inWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const removeWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

  /** จำลองการชำระเงิน: ล้างตะกร้า เพิ่มเกมเข้าคลัง และบันทึกคำสั่งซื้อ */
  const checkout = useCallback((gameIds: string[], titles: string[], total: number): PaidOrder => {
    const id = `#ORD-${orderSeq++}`;
    const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

    setPurchased((prev) => [...new Set([...prev, ...gameIds])]);
    setNewOrders((prev) => [
      { id, date: today, items: titles.join(", "), total: `฿${total.toLocaleString()}`, status: "FULFILLED" },
      ...prev,
    ]);
    setItems((prev) => prev.filter((x) => !gameIds.includes(x)));
    setWishlist((prev) => prev.filter((x) => !gameIds.includes(x)));

    return { id, titles, total };
  }, []);

  const value = useMemo<ShopValue>(
    () => ({
      items,
      count: items.length,
      has,
      toggle,
      add,
      remove,
      clear,
      wishlist,
      inWishlist,
      toggleWishlist,
      removeWishlist,
      purchased,
      newOrders,
      checkout,
    }),
    [
      items, has, toggle, add, remove, clear,
      wishlist, inWishlist, toggleWishlist, removeWishlist,
      purchased, newOrders, checkout,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useCart(): ShopValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useCart ต้องอยู่ภายใน <CartProvider>");
  return ctx;
}
