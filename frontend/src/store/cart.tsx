import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface CartValue {
  items: string[];
  count: number;
  has: (gameId: string) => boolean;
  toggle: (gameId: string) => void;
  add: (gameId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

/** ตะกร้าแบบเก็บในหน่วยความจำ — เมื่อต่อ backend แล้วให้เปลี่ยนไปเรียก /api/cart */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  const has = useCallback((id: string) => items.includes(id), [items]);

  const add = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggle = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({ items, count: items.length, has, toggle, add, clear }),
    [items, has, toggle, add, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart ต้องอยู่ภายใน <CartProvider>");
  return ctx;
}
