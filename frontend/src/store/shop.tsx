import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEV_REQUESTS,
  GAME_REVIEWS,
  GENRES,
  PROFILE,
  SEED_GAMES,
  SEED_ORDERS,
  SEED_USERS,
  type DevRequest,
  type Game,
  type GameReview,
  type OrderRow,
  type PlatformUser,
} from "../data/mock";

/**
 * สถานะกลางของแพลตฟอร์ม — ใช้ร่วมกันทุกหน้า
 *
 * วงจรการทำงาน:
 *   ผู้พัฒนาอัปโหลดเกม (PENDING) → ผู้ดูแลระบบอนุมัติ (APPROVED) → เกมขึ้นร้านค้า
 *   → ผู้ใช้ใส่ตะกร้าและชำระเงิน → ได้ License Key และเกมเข้าคลัง → ดาวน์โหลดได้
 *
 * ตอนนี้เก็บไว้ในหน่วยความจำของเบราว์เซอร์ (รีเฟรชแล้วกลับไปค่าตั้งต้น)
 * เมื่อต่อ backend แล้วให้แทนที่ด้วยการเรียก API ใน lib/api.ts
 */

export interface LibraryEntry {
  gameId: string;
  licenseKey: string;
  acquiredAt: string;
  orderId: string;
  pricePaid: number;
  downloadCount: number;
}

export interface PaidOrder {
  id: string;
  titles: string[];
  total: number;
}

export interface Review extends GameReview {
  id: string;
  gameId: string;
}

/** รีวิวตั้งต้นของเกมที่ขายอยู่แล้ว */
const SEED_REVIEWS: Review[] = Object.entries(GAME_REVIEWS).flatMap(([slug, list]) => {
  const game = SEED_GAMES.find((g) => g.slug === slug);
  return game ? list.map((r, i) => ({ ...r, id: `${slug}-r${i}`, gameId: game.id })) : [];
});

export interface NewGameDraft {
  title: string;
  price: number;
  genre: string;
  description: string;
  /** 0 = ยังไม่ได้อัปโหลดไฟล์เกม (ใส่ทีหลังได้) */
  sizeMB: number;
  /** รูปปกที่ผู้พัฒนาอัปโหลด (object URL ของไฟล์ที่เลือก) */
  coverUrl?: string | null;
  screenshots?: string[];
  videoUrl?: string | null;
}

/** ข้อมูลที่ผู้พัฒนาแก้ไขได้ */
export type GamePatch = Partial<
  Pick<Game, "title" | "price" | "genre" | "description" | "coverUrl" | "screenshots" | "videoUrl" | "sizeMB">
>;

interface ShopValue {
  /* ---- คลังข้อมูลเกม ---- */
  games: Game[];
  approvedGames: Game[];
  pendingGames: Game[];
  gamesByDev: (dev: string) => Game[];
  findGame: (slug: string) => Game | undefined;
  submitGame: (draft: NewGameDraft, dev: string) => Game;
  updateGame: (id: string, patch: GamePatch) => void;
  deleteGame: (id: string) => void;
  approveGame: (id: string) => void;
  rejectGame: (id: string, note?: string) => void;

  /* ---- รีวิว ---- */
  reviews: Review[];
  reviewsFor: (gameId: string) => Review[];
  addReview: (gameId: string, stars: number, text: string, author: string, initial: string) => void;
  replyReview: (reviewId: string, studio: string, text: string) => void;

  /* ---- ตะกร้า ---- */
  items: string[];
  count: number;
  has: (gameId: string) => boolean;
  toggle: (gameId: string) => void;
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  clear: () => void;

  /* ---- รายการที่ต้องการ ---- */
  wishlist: string[];
  inWishlist: (gameId: string) => boolean;
  toggleWishlist: (gameId: string) => void;

  /* ---- คลังเกมและคำสั่งซื้อ ---- */
  library: LibraryEntry[];
  /** คำสั่งซื้อทั้งแพลตฟอร์ม (ผู้ดูแลระบบเห็นทั้งหมด) */
  orders: OrderRow[];
  /** คำสั่งซื้อของผู้ใช้ที่ล็อกอินอยู่ */
  myOrders: OrderRow[];
  owns: (gameId: string) => boolean;
  checkout: () => PaidOrder | null;
  markDownloaded: (gameId: string) => void;
  /** PAID → FULFILLED */
  fulfillOrder: (id: string) => void;
  /** PENDING → CANCELLED */
  cancelOrder: (id: string) => void;
  /** คืนเงิน: เพิกถอนสิทธิ์ในคลังเกมของผู้ซื้อ และหักยอดขายของผู้พัฒนา */
  refundOrder: (id: string) => void;

  /* ---- ผู้ใช้และผู้พัฒนา (ผู้ดูแลระบบ) ---- */
  users: PlatformUser[];
  setUserStatus: (id: string, status: PlatformUser["status"]) => void;
  /** บัญชีนี้ถูกระงับอยู่หรือไม่ (ค้นจากชื่อ) */
  isSuspended: (name: string) => boolean;
  devRequests: DevRequest[];
  approveDevRequest: (id: string) => void;
  rejectDevRequest: (id: string) => void;

  /* ---- หมวดหมู่เกม ---- */
  categories: string[];
  addCategory: (name: string) => boolean;
  removeCategory: (name: string) => boolean;
}

const ShopContext = createContext<ShopValue | null>(null);

const COLORS = ["#1A2440", "#2A1240", "#13261F", "#253014", "#0F2236", "#14302F", "#2E1A14", "#301528"];
const ACCENTS = ["#FFA94D", "#FF5FA2", "#F5C04A", "#C8F04A", "#6EA8FF", "#5BD4C4", "#FF7A45", "#FF8FC7"];

const slugify = (title: string) =>
  title.trim().toLowerCase().replace(/[^\w฀-๿]+/g, "-").replace(/^-+|-+$/g, "") || "game";

function makeLicenseKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HSG-${block()}-${block()}-${block()}`;
}

const today = () =>
  new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function ShopProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(SEED_GAMES);
  const [items, setItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>(SEED_ORDERS);
  const [users, setUsers] = useState<PlatformUser[]>(SEED_USERS);
  const [devRequests, setDevRequests] = useState<DevRequest[]>(DEV_REQUESTS);
  const [categories, setCategories] = useState<string[]>(GENRES.filter((g) => g !== "ทั้งหมด"));

  /* ---------- ผู้ใช้ ---------- */

  const suspendedNames = useMemo(
    () => new Set(users.filter((u) => u.status === "SUSPENDED").map((u) => u.name)),
    [users]
  );
  const isSuspended = useCallback((name: string) => suspendedNames.has(name), [suspendedNames]);

  const setUserStatus = useCallback((id: string, status: PlatformUser["status"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id && u.role !== "ADMIN" ? { ...u, status } : u)));
  }, []);

  const approveDevRequest = useCallback(
    (id: string) => {
      const req = devRequests.find((r) => r.id === id);
      if (!req) return;
      setDevRequests((prev) => prev.filter((r) => r.id !== id));
      setUsers((prev) =>
        prev.some((u) => u.name === req.name)
          ? prev.map((u) => (u.name === req.name ? { ...u, role: "DEVELOPER" as const } : u))
          : [
              ...prev,
              {
                id: `d${Date.now()}`,
                name: req.name,
                email: req.email,
                role: "DEVELOPER" as const,
                joined: today(),
                status: "ACTIVE" as const,
              },
            ]
      );
    },
    [devRequests]
  );

  const rejectDevRequest = useCallback((id: string) => {
    setDevRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /* ---------- หมวดหมู่ ---------- */

  const addCategory = useCallback(
    (name: string) => {
      const n = name.trim();
      if (!n || n === "ทั้งหมด" || categories.includes(n)) return false;
      setCategories((prev) => [...prev, n]);
      return true;
    },
    [categories]
  );
  const [orderSeq, setOrderSeq] = useState(24118);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);

  /* ---------- คลังข้อมูลเกม ---------- */

  /** เกมที่ขายอยู่หน้าร้าน = อนุมัติแล้ว และบัญชีผู้พัฒนาไม่ถูกระงับ */
  const approvedGames = useMemo(
    () => games.filter((g) => g.status === "APPROVED" && !suspendedNames.has(g.dev)),
    [games, suspendedNames]
  );
  const pendingGames = useMemo(() => games.filter((g) => g.status === "PENDING"), [games]);

  /** ลบได้เฉพาะหมวดที่ไม่มีเกมใช้อยู่ */
  const removeCategory = useCallback(
    (name: string) => {
      if (games.some((g) => g.genre === name)) return false;
      setCategories((prev) => prev.filter((c) => c !== name));
      return true;
    },
    [games]
  );

  const gamesByDev = useCallback((dev: string) => games.filter((g) => g.dev === dev), [games]);
  const findGame = useCallback((slug: string) => games.find((g) => g.slug === slug), [games]);

  /** ผู้พัฒนาส่งเกมใหม่ — เข้าคิวรอผู้ดูแลระบบตรวจสอบ */
  const submitGame = useCallback((draft: NewGameDraft, dev: string): Game => {
    const id = `u${Date.now()}`;
    const i = Math.floor(Math.random() * COLORS.length);
    const game: Game = {
      id,
      slug: `${slugify(draft.title)}-${id.slice(-4)}`,
      title: draft.title.trim(),
      genre: draft.genre,
      dev,
      price: draft.price,
      rating: 0,
      reviews: 0,
      color: COLORS[i],
      accent: ACCENTS[i],
      coverUrl: draft.coverUrl ?? null,
      screenshots: draft.screenshots ?? [],
      videoUrl: draft.videoUrl ?? null,
      status: "PENDING",
      sizeMB: draft.sizeMB,
      releaseDate: "—",
      submittedAt: today(),
      unitsSold: 0,
      description: draft.description.trim(),
    };
    setGames((prev) => [game, ...prev]);
    return game;
  }, []);

  /** ผู้พัฒนาแก้ไขเกมของตัวเอง — ถ้าเคยถูกปฏิเสธ จะกลับเข้าคิวรอตรวจสอบใหม่ */
  const updateGame = useCallback((id: string, patch: GamePatch) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              ...patch,
              ...(g.status === "REJECTED"
                ? { status: "PENDING" as const, rejectNote: undefined, submittedAt: today() }
                : {}),
            }
          : g
      )
    );
  }, []);

  const deleteGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    setItems((prev) => prev.filter((x) => x !== id));
    setWishlist((prev) => prev.filter((x) => x !== id));
    setReviews((prev) => prev.filter((r) => r.gameId !== id));
  }, []);

  const approveGame = useCallback((id: string) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: "APPROVED" as const, releaseDate: today(), rejectNote: undefined }
          : g
      )
    );
  }, []);

  const rejectGame = useCallback((id: string, note = "ไม่ผ่านเกณฑ์การตรวจสอบ") => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "REJECTED" as const, rejectNote: note } : g))
    );
  }, []);

  /* ---------- รีวิว ---------- */

  const reviewsFor = useCallback(
    (gameId: string) => reviews.filter((r) => r.gameId === gameId),
    [reviews]
  );

  const addReview = useCallback(
    (gameId: string, stars: number, text: string, author: string, initial: string) => {
      setReviews((prev) => [
        {
          id: `rv${Date.now()}`,
          gameId,
          author,
          initial,
          avatarColor: "#3B5A9A",
          stars,
          text,
          meta: "เพิ่งเขียนเมื่อสักครู่",
        },
        ...prev,
      ]);
    },
    []
  );

  const replyReview = useCallback((reviewId: string, studio: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, devReply: { studio, text } } : r))
    );
  }, []);

  /* ---------- ตะกร้า ---------- */

  const has = useCallback((id: string) => items.includes(id), [items]);
  const add = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((x) => x !== id)), []);
  const toggle = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  /* ---------- รายการที่ต้องการ ---------- */

  const inWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  /* ---------- คลังเกม ---------- */

  const owns = useCallback((id: string) => library.some((e) => e.gameId === id), [library]);

  /** จำลองการชำระเงิน: ออก License Key ให้ทุกเกมในตะกร้า แล้วย้ายเข้าคลัง */
  const checkout = useCallback((): PaidOrder | null => {
    if (suspendedNames.has(PROFILE.name)) return null;
    const buying = approvedGames.filter((g) => items.includes(g.id) && !library.some((e) => e.gameId === g.id));
    if (buying.length === 0) return null;

    const id = `#ORD-${orderSeq}`;
    const date = today();
    const total = buying.reduce((sum, g) => sum + g.price, 0);

    setOrderSeq((n) => n + 1);
    setLibrary((prev) => [
      ...buying.map((g) => ({
        gameId: g.id,
        licenseKey: makeLicenseKey(),
        acquiredAt: date,
        orderId: id,
        pricePaid: g.price,
        downloadCount: 0,
      })),
      ...prev,
    ]);
    setOrders((prev) => [
      {
        id,
        date,
        buyer: PROFILE.name,
        items: buying.map((g) => g.title).join(", "),
        gameIds: buying.map((g) => g.id),
        total,
        status: "FULFILLED" as const,
        ref: `pay_mock_${orderSeq}${Math.random().toString(16).slice(2, 6)}…`,
      },
      ...prev,
    ]);
    // ยอดขายของผู้พัฒนาเพิ่มขึ้นตามจริง
    setGames((prev) =>
      prev.map((g) => (buying.some((b) => b.id === g.id) ? { ...g, unitsSold: g.unitsSold + 1 } : g))
    );
    setItems([]);
    setWishlist((prev) => prev.filter((x) => !buying.some((b) => b.id === x)));

    return { id, titles: buying.map((g) => g.title), total };
  }, [approvedGames, items, library, orderSeq, suspendedNames]);

  const myOrders = useMemo(() => orders.filter((o) => o.buyer === PROFILE.name), [orders]);

  const setOrderStatus = (id: string, from: OrderRow["status"][], to: OrderRow["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id && from.includes(o.status) ? { ...o, status: to } : o)));
  };

  const fulfillOrder = useCallback((id: string) => {
    setOrderStatus(id, ["PAID"], "FULFILLED");
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOrderStatus(id, ["PENDING"], "CANCELLED");
  }, []);

  const refundOrder = useCallback(
    (id: string) => {
      const order = orders.find((o) => o.id === id);
      if (!order || (order.status !== "FULFILLED" && order.status !== "PAID")) return;
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "REFUNDED" as const } : o)));
      // เพิกถอนสิทธิ์ (License Key) ที่ออกให้จากคำสั่งซื้อนี้
      setLibrary((prev) => prev.filter((e) => e.orderId !== id));
      // หักยอดขายของผู้พัฒนาออก
      setGames((prev) =>
        prev.map((g) =>
          order.gameIds.includes(g.id) ? { ...g, unitsSold: Math.max(0, g.unitsSold - 1) } : g
        )
      );
    },
    [orders]
  );

  const markDownloaded = useCallback((gameId: string) => {
    setLibrary((prev) =>
      prev.map((e) => (e.gameId === gameId ? { ...e, downloadCount: e.downloadCount + 1 } : e))
    );
  }, []);

  /** จำนวนในตะกร้า นับเฉพาะเกมที่ยังขายอยู่และยังไม่มีในคลัง */
  const cartCount = useMemo(
    () => items.filter((id) => approvedGames.some((g) => g.id === id) && !library.some((e) => e.gameId === id)).length,
    [items, approvedGames, library]
  );

  const value = useMemo<ShopValue>(
    () => ({
      games, approvedGames, pendingGames, gamesByDev, findGame,
      submitGame, updateGame, deleteGame, approveGame, rejectGame,
      reviews, reviewsFor, addReview, replyReview,
      items, count: cartCount, has, toggle, add, remove, clear,
      wishlist, inWishlist, toggleWishlist,
      library, orders, myOrders, owns, checkout, markDownloaded, fulfillOrder, cancelOrder, refundOrder,
      users, setUserStatus, isSuspended, devRequests, approveDevRequest, rejectDevRequest,
      categories, addCategory, removeCategory,
    }),
    [
      games, approvedGames, pendingGames, gamesByDev, findGame,
      submitGame, updateGame, deleteGame, approveGame, rejectGame,
      reviews, reviewsFor, addReview, replyReview,
      items, cartCount, has, toggle, add, remove, clear,
      wishlist, inWishlist, toggleWishlist,
      library, orders, myOrders, owns, checkout, markDownloaded, fulfillOrder, cancelOrder, refundOrder,
      users, setUserStatus, isSuspended, devRequests, approveDevRequest, rejectDevRequest,
      categories, addCategory, removeCategory,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop ต้องอยู่ภายใน <ShopProvider>");
  return ctx;
}
