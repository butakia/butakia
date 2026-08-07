"use client";

import { StickyNote, X, Highlighter } from "lucide-react";

interface PanelHighlight {
  id: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text?: string;
  color?: string;
  note?: string | null;
}

export default function NotesPanel({
  open,
  onClose,
  highlights,
  onJumpTo,
}: {
  open: boolean;
  onClose: () => void;
  highlights: PanelHighlight[];
  onJumpTo: (h: PanelHighlight) => void;
}) {
  if (!open) return null;

  const items = highlights.filter((h) => h.text);
  const withNotes = items.filter((h) => h.note);
  const withoutNotes = items.filter((h) => !h.note);

  const list = (
    <>
      {items.length === 0 ? (
        <p className="p-4 text-center text-sm text-white/40">
          Aún no has subrayado nada. Selecciona texto en la página para empezar.
        </p>
      ) : (
        <div className="flex flex-col gap-4 p-3">
          {withNotes.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                <StickyNote size={11} />
                Notas
              </p>
              <ul className="flex flex-col gap-1.5">
                {withNotes.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => onJumpTo(h)}
                      className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:border-accent/40 hover:bg-white/[0.07]"
                    >
                      <span className="flex items-start gap-2">
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: h.color || "#fde047" }}
                        />
                        <span className="line-clamp-2 text-xs italic text-white/50">&ldquo;{h.text}&rdquo;</span>
                      </span>
                      <span className="line-clamp-3 pl-4.5 text-sm text-white/90">{h.note}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {withoutNotes.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                <Highlighter size={11} />
                Subrayados
              </p>
              <ul className="flex flex-col gap-1.5">
                {withoutNotes.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => onJumpTo(h)}
                      className="flex w-full items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:border-accent/40 hover:bg-white/[0.07]"
                    >
                      <span
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: h.color || "#fde047" }}
                      />
                      <span className="line-clamp-2 text-sm text-white/80">{h.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: floating panel docked to the side of the reading area. */}
      <div className="fixed right-4 top-24 z-40 hidden max-h-[70vh] w-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl animate-[fadeIn_0.2s_ease-out] sm:flex">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold text-white">
            <StickyNote size={15} className="text-accent" />
            Mis notas y subrayados
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de notas"
            className="text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto">{list}</div>
      </div>

      {/* Mobile: bottom drawer with backdrop. */}
      <div className="fixed inset-0 z-40 sm:hidden">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 flex max-h-[75vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-zinc-950 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <StickyNote size={15} className="text-accent" />
              Mis notas y subrayados
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de notas"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto pb-[env(safe-area-inset-bottom)]">{list}</div>
        </div>
      </div>
    </>
  );
}
