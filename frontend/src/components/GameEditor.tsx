import { useEffect, useState, type FormEvent } from "react";
import type { Game } from "../data/mock";
import { UploadIcon } from "./icons";
import { useShop, type GamePatch } from "../store/shop";

const MAX_FILE_MB = 200;
const MAX_SHOTS = 5;

/** หน้าต่างแก้ไขข้อมูลเกมของผู้พัฒนา */
export default function GameEditor({ game, onClose }: { game: Game; onClose: () => void }) {
  const shop = useShop();

  const [title, setTitle] = useState(game.title);
  const [price, setPrice] = useState(String(game.price));
  const [genre, setGenre] = useState(game.genre);
  const [description, setDescription] = useState(game.description);
  const [coverUrl, setCoverUrl] = useState<string | null>(game.coverUrl ?? null);
  const [screenshots, setScreenshots] = useState<string[]>(game.screenshots);
  const [videoUrl, setVideoUrl] = useState(game.videoUrl ?? "");
  const [sizeMB, setSizeMB] = useState(game.sizeMB ? String(game.sizeMB) : "");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ปิดหน้าต่างด้วยปุ่ม Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    const sizeNum = sizeMB.trim() === "" ? 0 : Number(sizeMB);

    if (!title.trim()) return setError("กรุณากรอกชื่อเกม");
    if (!description.trim()) return setError("กรุณากรอกคำอธิบายเกม");
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError("ราคาต้องเป็นตัวเลขไม่ติดลบ");
    if (!Number.isFinite(sizeNum) || sizeNum < 0) return setError("ขนาดไฟล์ไม่ถูกต้อง");
    if (sizeNum > MAX_FILE_MB) return setError(`ไฟล์เกมต้องไม่เกิน ${MAX_FILE_MB} MB`);

    const patch: GamePatch = {
      title: title.trim(),
      price: priceNum,
      genre,
      description: description.trim(),
      coverUrl,
      screenshots,
      videoUrl: videoUrl.trim() || null,
      sizeMB: sizeNum,
    };
    // TODO: ต่อกับ PATCH /api/games/:id
    shop.updateGame(game.id, patch);
    onClose();
  }

  function addScreenshots(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, MAX_SHOTS - screenshots.length)
      .map((f) => URL.createObjectURL(f));
    setScreenshots((prev) => [...prev, ...urls].slice(0, MAX_SHOTS));
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="modal__head">
          <div>
            <h2 id="editor-title" style={{ fontSize: 22, fontWeight: 600 }}>
              แก้ไขเกม
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              {game.status === "REJECTED"
                ? "แก้ไขแล้วเกมจะถูกส่งกลับเข้าคิวรอตรวจสอบอีกครั้ง"
                : game.status === "APPROVED"
                  ? "เกมเผยแพร่อยู่แล้ว การแก้ไขจะมีผลทันที"
                  : "เกมอยู่ระหว่างรอตรวจสอบ"}
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="ปิดหน้าต่าง" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="modal__body">
          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: "2 1 220px" }}>
              <label htmlFor="ed-title">ชื่อเกม</label>
              <input id="ed-title" value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} />
            </div>
            <div className="field" style={{ flex: "1 1 120px" }}>
              <label htmlFor="ed-price">ราคา (บาท)</label>
              <input id="ed-price" type="number" min={0} value={price} onChange={(e) => { setPrice(e.target.value); setError(null); }} />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="ed-genre">ประเภท</label>
              <select id="ed-genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
                {shop.categories.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="ed-desc">คำอธิบาย</label>
            <textarea id="ed-desc" rows={4} value={description} onChange={(e) => { setDescription(e.target.value); setError(null); }} />
          </div>

          {/* ---------- รูปปก ---------- */}
          <div className="field">
            <label htmlFor="ed-cover">รูปปกเกม</label>
            <div className="row" style={{ gap: 14 }}>
              <span className="media-thumb" style={{ width: 128, height: 80 }}>
                {coverUrl ? (
                  <img src={coverUrl} alt="ตัวอย่างรูปปก" />
                ) : (
                  <span className="muted" style={{ fontSize: 12 }}>
                    ยังไม่มีรูป
                  </span>
                )}
              </span>
              <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  id="ed-cover"
                  type="file"
                  accept="image/*"
                  style={{ paddingTop: 11 }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setCoverUrl(URL.createObjectURL(f));
                  }}
                />
                {coverUrl && (
                  <button type="button" className="btn btn--secondary btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => setCoverUrl(null)}>
                    ลบรูปปก
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ---------- ภาพหน้าจอ ---------- */}
          <div className="field">
            <label htmlFor="ed-shots">ภาพหน้าจอ (สูงสุด {MAX_SHOTS} ภาพ)</label>
            {screenshots.length > 0 && (
              <div className="row" style={{ gap: 10 }}>
                {screenshots.map((url, i) => (
                  <span key={url} className="media-thumb" style={{ width: 104, height: 64, position: "relative" }}>
                    <img src={url} alt={`ภาพหน้าจอที่ ${i + 1}`} />
                    <button
                      type="button"
                      aria-label={`ลบภาพหน้าจอที่ ${i + 1}`}
                      onClick={() => setScreenshots((prev) => prev.filter((u) => u !== url))}
                      className="media-thumb__remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              id="ed-shots"
              type="file"
              accept="image/*"
              multiple
              style={{ paddingTop: 11 }}
              disabled={screenshots.length >= MAX_SHOTS}
              onChange={(e) => addScreenshots(e.target.files)}
            />
            <span className="field__hint">
              {screenshots.length >= MAX_SHOTS ? "ครบจำนวนสูงสุดแล้ว" : `เพิ่มได้อีก ${MAX_SHOTS - screenshots.length} ภาพ`}
            </span>
          </div>

          {/* ---------- คลิปวิดีโอ ---------- */}
          <div className="field">
            <label htmlFor="ed-video">คลิปวิดีโอแนะนำเกม</label>
            <input
              id="ed-video"
              type="url"
              placeholder="วางลิงก์ YouTube หรือ URL วิดีโอ"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <div className="row" style={{ gap: 10 }}>
              <label className="btn btn--secondary btn--sm" style={{ cursor: "pointer" }}>
                หรืออัปโหลดไฟล์วิดีโอ
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setVideoUrl(URL.createObjectURL(f));
                  }}
                />
              </label>
              {videoUrl && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setVideoUrl("")}>
                  ลบวิดีโอ
                </button>
              )}
            </div>
          </div>

          {/* ---------- ไฟล์เกม ---------- */}
          <div className="field">
            <label htmlFor="ed-file">ไฟล์เกม (.zip)</label>
            <label className="dropzone">
              <UploadIcon size={24} />
              <b>{Number(sizeMB) > 0 ? `มีไฟล์แล้ว · ${sizeMB} MB` : "ยังไม่มีไฟล์เกม — ใส่ทีหลังได้"}</b>
              <span className="muted" style={{ fontSize: 13 }}>
                ขนาดไม่เกิน {MAX_FILE_MB} MB · จัดเก็บแบบส่วนตัวบน AWS S3
              </span>
              <input
                id="ed-file"
                type="file"
                accept=".zip"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSizeMB(String(Math.max(1, Math.round(f.size / (1024 * 1024)))));
                  setError(null);
                }}
              />
            </label>
            <div className="row" style={{ gap: 10 }}>
              <input
                type="number"
                min={0}
                max={MAX_FILE_MB}
                placeholder="ขนาดไฟล์ (MB)"
                value={sizeMB}
                onChange={(e) => { setSizeMB(e.target.value); setError(null); }}
                style={{ maxWidth: 200 }}
                aria-label="ขนาดไฟล์เกมเป็น MB"
              />
              {Number(sizeMB) > 0 && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setSizeMB("")}>
                  นำไฟล์ออก
                </button>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
              {error}
            </p>
          )}
        </form>

        <div className="modal__foot">
          {confirmDelete ? (
            <div className="row row--between" style={{ width: "100%", gap: 12 }}>
              <span style={{ color: "var(--danger-fg)", fontSize: 14 }}>
                ลบ “{game.title}” ถาวร? ผู้ที่ซื้อไปแล้วจะไม่เห็นเกมนี้ในคลังอีก
              </span>
              <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirmDelete(false)}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => {
                    // TODO: ต่อกับ DELETE /api/games/:id
                    shop.deleteGame(game.id);
                    onClose();
                  }}
                >
                  ยืนยันลบเกม
                </button>
              </span>
            </div>
          ) : (
            <div className="row row--between" style={{ width: "100%", gap: 12 }}>
              <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirmDelete(true)}>
                ลบเกมนี้
              </button>
              <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                <button type="button" className="btn btn--secondary" onClick={onClose}>
                  ยกเลิก
                </button>
                <button type="button" className="btn btn--primary" onClick={handleSave}>
                  บันทึกการเปลี่ยนแปลง
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
