import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface LibraryEntry {
  id: string;
  licenseKey: string | null;
  downloadCount: number;
  game: {
    id: string;
    title: string;
    fileName: string | null;
    developer: { studioName: string };
  };
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<LibraryEntry[]>("/library")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h1>คลังเกมของฉัน</h1>
      {items.length === 0 && <p>ยังไม่มีเกมในคลัง</p>}
      <div className="grid">
        {items.map((item) => (
          <article key={item.id} className="card">
            <h3>{item.game.title}</h3>
            <p className="muted">{item.game.developer.studioName}</p>
            <p className="key">{item.licenseKey ?? "ไม่มีรหัสผลิตภัณฑ์"}</p>
            <p className="muted">ดาวน์โหลดแล้ว {item.downloadCount} ครั้ง</p>
            <a className="button" href={`/api/library/${item.game.id}/download`}>
              ดาวน์โหลด
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
