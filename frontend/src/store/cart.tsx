import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface CartValue {
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
}

const CartContext = createContext<CartValue | null>(null);

/**
 * ตะกร้าและ Wishlist แบบเก็บในหน่วยความจำ
 * เมื่อต่อ backend แล้วให้เปลี่ยนไปเรียก /api/cart และ /api/wishlist
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

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

  const value = useMemo<CartValue>(
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
    }),
    [items, has, toggle, add, remove, clear, wishlist, inWishlist, toggleWishlist, removeWishlist]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart ต้องอยู่ภายใน <CartProvider>");
  return ctx;
}
