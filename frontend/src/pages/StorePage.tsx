import { useEffect, useState } from "react";
import { api, type Game } from "../lib/api";

export default function StorePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<Game[]>(`/games?q=${encodeURIComponent(query)}`)
      .then(setGames)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  async function addToCart(gameId: string) {
    try {
      await api("/cart", { method: "POST", body: JSON.stringify({ gameId }) });
      alert("เพิ่มลงตะกร้าแล้ว");
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <section>
      <h1>ร้านค้า</h1>

      <input
        className="search"
        placeholder="ค้นหาเกม..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && games.length === 0 && <p>ยังไม่มีเกมในระบบ</p>}

      <div className="grid">
        {games.map((game) => (
          <article key={game.id} className="card">
            <h3>{game.title}</h3>
            <p className="muted">{game.developer?.studioName}</p>
            <p>{game.description.slice(0, 120)}</p>
            <p className="price">{Number(game.priceTHB).toLocaleString()} บาท</p>
            {game.avgRating != null && (
              <p className="muted">
                ★ {game.avgRating} ({game.reviewCount} รีวิว)
              </p>
            )}
            <button onClick={() => addToCart(game.id)}>ใส่ตะกร้า</button>
          </article>
        ))}
      </div>
    </section>
  );
}
