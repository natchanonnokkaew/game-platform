import { useEffect, useState } from "react";
import type { Game } from "../data/mock";
import { CoverArt } from "./GameCard";

export const MAX_FILE_MB = 200;

const QUICK_REASONS = [
  "ไฟล์เกมไม่ครบหรือเปิดไม่ได้",
  "ข้อมูลหรือรูปภาพไม่ครบ",
  "ราคาไม่เหมาะสม",
  "เนื้อหาไม่เหมาะสม",
];

export interface CheckItem {
  label: string;
  ok: boolean;
  /** true = ต้องผ่านก่อนอนุมัติได้ */
  required: boolean;
}

/** รายการตรวจเกมก่อนเผยแพร่ — ใช้ร่วมกันทั้งการ์ดในคิวและหน้าต่างตรวจสอบ */
export function reviewChecklist(game: Game, devSuspended: boolean): CheckItem[] {
  return [
    { label: "มีไฟล์เกม (.zip)", ok: game.sizeMB > 0, required: true },
    { label: `ขนาดไฟล์ไม่เกิน ${MAX_FILE_MB} MB`, ok: game.sizeMB <= MAX_FILE_MB, required: true },
    { label: "บัญชีผู้พัฒนาอยู่ในสถานะปกติ", ok: !devSuspended, required: true },
    { label: "มีรูปปกเกม", ok: !!game.coverUrl, required: false },
    { label: "มีภาพหน้าจออย่างน้อย 1 ภาพ", ok: game.screenshots.length > 0, required: false },
    { label: "คำอธิบายยาวพอ (20 ตัวอักษรขึ้นไป)", ok: game.description.trim().length >= 20, required: false },
  ];
}

export const canApprove = (items: CheckItem[]) => items.every((c) => c.ok || !c.required);

const isVideoFile = (url: string) => url.startsWith("blob:") || /\.(mp4|webm|ogg)(\?|$)/i.test(url);

/** หน้าต่างตรวจสอบเกมของผู้ดูแลระบบ ก่อนอนุมัติหรือปฏิเสธ */
export default function GameReviewModal({
  game,
  devSuspended,
  onClose,
  onApprove,
  onReject,
}: {
  game: Game;
  devSuspended: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (note: string) => void;
}) {
  const [shot, setShot] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const checks = reviewChecklist(game, devSuspended);
  const approvable = canApprove(checks);
  const current = game.screenshots[shot];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title" style={{ maxWidth: 880 }}>
        <div className="modal__head">
          <div>
            <h2 id="review-title" style={{ fontSize: 22, fontWeight: 600 }}>
              ตรวจสอบเกม: {game.title}
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              {game.dev} · ส่งเมื่อ {game.submittedAt ?? "—"}
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="ปิดหน้าต่าง" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {/* ---------- สื่อของเกม ---------- */}
            <div style={{ flex: "3 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: game.color,
                }}
              >
                {current ? (
                  <img src={current} alt={`ภาพหน้าจอที่ ${shot + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : game.coverUrl ? (
                  <img src={game.coverUrl} alt="รูปปกเกม" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <CoverArt color={game.color} accent={game.accent} />
                )}
                <span className="pill" style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(10,19,36,.8)" }}>
                  {current ? `ภาพหน้าจอ ${shot + 1}/${game.screenshots.length}` : game.coverUrl ? "รูปปก" : "ยังไม่มีรูปปก (ภาพจำลอง)"}
                </span>
              </div>

              {game.screenshots.length > 1 && (
                <div className="row" style={{ gap: 8 }}>
                  {game.screenshots.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      className="media-thumb"
                      aria-label={`ดูภาพหน้าจอที่ ${i + 1}`}
                      aria-pressed={i === shot}
                      onClick={() => setShot(i)}
                      style={{ width: 88, height: 52, padding: 0, cursor: "pointer", outline: i === shot ? "2px solid var(--accent)" : "none" }}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}

              {game.videoUrl ? (
                isVideoFile(game.videoUrl) ? (
                  <video src={game.videoUrl} controls style={{ width: "100%", borderRadius: 12, background: "#000" }} />
                ) : (
                  <a href={game.videoUrl} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm" style={{ alignSelf: "flex-start" }}>
                    เปิดคลิปวิดีโอแนะนำเกม ↗
                  </a>
                )
              ) : (
                <span className="muted" style={{ fontSize: 13 }}>
                  ไม่มีคลิปวิดีโอแนะนำเกม
                </span>
              )}

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>คำอธิบาย</h3>
                <p className="dim" style={{ margin: 0, fontSize: 15 }}>
                  {game.description || "—"}
                </p>
              </div>
            </div>

            {/* ---------- ข้อมูลและรายการตรวจ ---------- */}
            <div style={{ flex: "2 1 260px", display: "flex", flexDirection: "column", gap: 16 }}>
              <dl
                className="panel"
                style={{ margin: 0, padding: 14, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 14px", fontSize: 14 }}
              >
                <dt className="muted">ราคา</dt>
                <dd style={{ margin: 0 }}>฿{game.price.toLocaleString()}</dd>
                <dt className="muted">ประเภท</dt>
                <dd style={{ margin: 0 }}>{game.genre}</dd>
                <dt className="muted">ไฟล์เกม</dt>
                <dd style={{ margin: 0 }}>{game.sizeMB > 0 ? `${game.sizeMB} MB` : "ยังไม่อัปโหลด"}</dd>
                <dt className="muted">ภาพหน้าจอ</dt>
                <dd style={{ margin: 0 }}>{game.screenshots.length} ภาพ</dd>
              </dl>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>รายการตรวจ</h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
                  {checks.map((c) => (
                    <li key={c.label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span
                        aria-hidden="true"
                        style={{ width: 18, flex: "none", color: c.ok ? "var(--ok-fg)" : c.required ? "var(--danger-fg)" : "var(--warn-fg)" }}
                      >
                        {c.ok ? "✓" : c.required ? "✕" : "!"}
                      </span>
                      <span>
                        {c.label}
                        {!c.ok && (
                          <span className="muted" style={{ fontSize: 12 }}>
                            {c.required ? " · ต้องแก้ก่อนอนุมัติ" : " · แนะนำ"}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="field">
                <label htmlFor="reject-note">เหตุผลกรณีปฏิเสธ (ส่งถึงผู้พัฒนา)</label>
                <div className="row" style={{ gap: 6 }}>
                  {QUICK_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="chip"
                      style={{ height: 32, fontSize: 13 }}
                      onClick={() => {
                        setNote(r);
                        setError(null);
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  id="reject-note"
                  rows={3}
                  value={note}
                  placeholder="ระบุสิ่งที่ผู้พัฒนาต้องแก้ไข"
                  onChange={(e) => {
                    setNote(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              {error && (
                <p role="alert" style={{ margin: 0, color: "var(--danger-fg)", fontSize: 14 }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="modal__foot">
          <div className="row row--between" style={{ width: "100%", gap: 12 }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {approvable ? "ผ่านเงื่อนไขที่จำเป็นครบแล้ว" : "ยังอนุมัติไม่ได้ — มีเงื่อนไขที่จำเป็นไม่ผ่าน"}
            </span>
            <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  if (!note.trim()) return setError("กรุณาระบุเหตุผลก่อนปฏิเสธ เพื่อให้ผู้พัฒนาแก้ไขได้ถูกจุด");
                  onReject(note.trim());
                }}
              >
                ปฏิเสธ
              </button>
              <button type="button" className="btn btn--primary" disabled={!approvable} onClick={onApprove}>
                อนุมัติและเผยแพร่
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
