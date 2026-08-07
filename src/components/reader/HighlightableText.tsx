"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote, Trash2, X, Check } from "lucide-react";
import { createHighlightAction, deleteHighlightAction, updateHighlightNoteAction } from "@/lib/books-actions";

export interface HighlightItem {
  id: string;
  startOffset: number;
  endOffset: number;
  color?: string;
  note?: string | null;
}

const HIGHLIGHT_COLORS = ["#fde047", "#86efac", "#93c5fd", "#f9a8d4", "#fca5a5"];

function getTextOffset(container: Node, targetNode: Node, targetOffset: number): number {
  let offset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === targetNode) return offset + targetOffset;
    offset += node.textContent?.length ?? 0;
  }
  return offset;
}

function buildSegments(content: string, highlights: HighlightItem[]) {
  const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
  const segments: { text: string; id?: string }[] = [];
  let cursor = 0;
  for (const h of sorted) {
    const start = Math.max(h.startOffset, cursor);
    const end = Math.max(h.endOffset, start);
    if (start > cursor) segments.push({ text: content.slice(cursor, start) });
    if (end > start) segments.push({ text: content.slice(start, end), id: h.id });
    cursor = Math.max(cursor, end);
  }
  if (cursor < content.length) segments.push({ text: content.slice(cursor) });
  return segments;
}

export default function HighlightableText({
  bookId,
  chapterId,
  content,
  initialHighlights,
  offsetBase = 0,
  onHighlightCreated,
  onHighlightRemoved,
  onNoteChange,
  autoHighlight = false,
  activeHighlightId,
}: {
  bookId: string;
  chapterId: string;
  content: string;
  initialHighlights: HighlightItem[];
  /** Start index of `content` within the full chapter text — chapters can be
   * split into several flip-pages, but highlight offsets are always stored
   * relative to the whole chapter, so we shift them into/out of this page's
   * local coordinate space. */
  offsetBase?: number;
  onHighlightCreated?: (highlight: { id: string; chapterId: string; startOffset: number; endOffset: number; text: string; color: string; note?: string | null }) => void;
  onHighlightRemoved?: (id: string) => void;
  onNoteChange?: (id: string, note: string | null) => void;
  /** Desktop (mouse) devices skip the "select then tap Subrayar" toolbar entirely —
   * releasing a text selection highlights it immediately, since there's no long-press
   * gesture to distinguish "selecting to read" from "selecting to highlight" anyway. */
  autoHighlight?: boolean;
  /** Highlight id to briefly pulse (set when the user jumps here from the notes panel). */
  activeHighlightId?: string | null;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageEnd = offsetBase + content.length;
  const [highlights, setHighlights] = useState(() =>
    initialHighlights
      .filter((h) => h.startOffset >= offsetBase && h.endOffset <= pageEnd)
      .map((h) => ({ ...h, startOffset: h.startOffset - offsetBase, endOffset: h.endOffset - offsetBase }))
  );
  const [toolbar, setToolbar] = useState<{ start: number; end: number; text: string } | null>(null);
  const [pickedColor, setPickedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [copied, setCopied] = useState(false);
  const [composingNote, setComposingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteDraft, setEditNoteDraft] = useState("");
  const markRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeHighlightId) return;
    const el = markRefs.current[activeHighlightId];
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeHighlightId]);

  const saveHighlight = async (start: number, end: number, text: string, color: string, note?: string) => {
    try {
      const created = await createHighlightAction(bookId, {
        chapterId,
        startOffset: start + offsetBase,
        endOffset: end + offsetBase,
        text,
        color,
        note: note || undefined,
      });
      setHighlights((prev) => [
        ...prev,
        { ...created, startOffset: created.startOffset - offsetBase, endOffset: created.endOffset - offsetBase },
      ]);
      onHighlightCreated?.({
        id: created.id,
        chapterId,
        startOffset: created.startOffset,
        endOffset: created.endOffset,
        text,
        color,
        note: created.note,
      });
    } catch {
      router.push("/login");
    } finally {
      setToolbar(null);
      setComposingNote(false);
      setNoteDraft("");
      window.getSelection()?.removeAllRanges();
    }
  };

  const readSelection = () => {
    const container = containerRef.current;
    if (!container) return null;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const text = sel.toString();
    if (!container.contains(range.commonAncestorContainer) || !text.trim()) return null;
    const start = getTextOffset(container, range.startContainer, range.startOffset);
    const end = getTextOffset(container, range.endContainer, range.endOffset);
    return { start: Math.min(start, end), end: Math.max(start, end), text };
  };

  useEffect(() => {
    // Desktop (mouse) devices: no toolbar, no separate "highlight mode" — releasing a
    // selection highlights it immediately in the current color, since there's no
    // long-press gesture to disambiguate "selecting to read" from "selecting to mark".
    // A note can still be attached afterward by clicking the new highlight.
    if (autoHighlight) {
      const onMouseUp = () => {
        const selection = readSelection();
        if (!selection) return;
        saveHighlight(selection.start, selection.end, selection.text, pickedColor);
      };
      document.addEventListener("mouseup", onMouseUp);
      return () => document.removeEventListener("mouseup", onMouseUp);
    }

    const onSelectionChange = () => {
      setEditingId(null);
      setToolbar(readSelection());
    };
    // "mouseup" alone misses touch-based selection on mobile (long-press + drag
    // handles never fire a mouseup) — "selectionchange" fires for both input types
    // and after the mobile selection handles are released, so the toolbar shows up
    // reliably on phones too.
    document.addEventListener("mouseup", onSelectionChange);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mouseup", onSelectionChange);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHighlight, pickedColor]);

  const handleHighlight = () => {
    if (!toolbar) return;
    saveHighlight(toolbar.start, toolbar.end, toolbar.text, pickedColor);
  };

  const handleSaveWithNote = () => {
    if (!toolbar) return;
    saveHighlight(toolbar.start, toolbar.end, toolbar.text, pickedColor, noteDraft);
  };

  const handleCopy = async () => {
    if (!toolbar) return;
    try {
      await navigator.clipboard.writeText(toolbar.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  const handleRemove = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    setEditingId(null);
    onHighlightRemoved?.(id);
    deleteHighlightAction(id).catch(() => {});
  };

  const openEditor = (h: HighlightItem) => {
    setEditingId(h.id);
    setEditNoteDraft(h.note ?? "");
  };

  const saveNote = async (id: string) => {
    const trimmed = editNoteDraft.trim();
    setHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, note: trimmed || null } : h)));
    onNoteChange?.(id, trimmed || null);
    setEditingId(null);
    try {
      await updateHighlightNoteAction(id, trimmed);
    } catch {
      // Best-effort — the local state already reflects the user's edit.
    }
  };

  const segments = buildSegments(content, highlights);

  return (
    <div
      ref={containerRef}
      className="relative whitespace-pre-wrap"
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none" }}
    >
      {segments.map((s, i) => {
        const h = s.id ? highlights.find((hl) => hl.id === s.id) : undefined;
        return s.id ? (
          <mark
            key={i}
            ref={(el) => {
              markRefs.current[s.id!] = el;
            }}
            onClick={() => h && openEditor(h)}
            title="Clic para editar la nota o quitar el subrayado"
            className={`relative cursor-pointer text-inherit transition-shadow duration-500 ${
              activeHighlightId === s.id ? "animate-[notePulse_1.4s_ease-out_2]" : ""
            }`}
            style={{ backgroundColor: `${h?.color ?? HIGHLIGHT_COLORS[0]}66` }}
          >
            {s.text}
            {h?.note && (
              <StickyNote
                size={11}
                className="ml-0.5 inline-block shrink-0 -translate-y-1 text-black/50"
                aria-hidden
              />
            )}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        );
      })}

      {editingId && (() => {
        const h = highlights.find((hl) => hl.id === editingId);
        if (!h) return null;
        return (
          <div
            style={{ position: "fixed", left: "50%", top: 12, transform: "translateX(-50%)" }}
            className="z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <StickyNote size={13} className="text-accent" />
                Nota
              </span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                aria-label="Cerrar"
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              value={editNoteDraft}
              onChange={(e) => setEditNoteDraft(e.target.value)}
              placeholder="Escribe tu nota sobre este fragmento..."
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRemove(h.id)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-white/50 hover:bg-white/10 hover:text-red-400"
              >
                <Trash2 size={13} />
                Quitar subrayado
              </button>
              <button
                type="button"
                onClick={() => saveNote(h.id)}
                className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white"
              >
                <Check size={13} />
                Guardar nota
              </button>
            </div>
          </div>
        );
      })()}

      {toolbar && (
        <div
          // Fixed near the top of the viewport instead of hovering right above the
          // selection: on Android Chrome, selecting text pops up the browser's own
          // "Search/Copy" bar near the bottom of the screen, which collided with (and
          // sometimes hid) our toolbar when it tracked the selection's position.
          // Anchoring it to a stable spot up top keeps it clear of that system UI.
          style={{ position: "fixed", left: "50%", top: 12, transform: "translateX(-50%)" }}
          className="z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-2.5 shadow-2xl"
        >
          {!composingNote ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPickedColor(c)}
                  aria-label={`Color ${c}`}
                  className={`h-6 w-6 shrink-0 rounded-full transition-transform ${pickedColor === c ? "scale-110 ring-2 ring-white" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <span className="mx-0.5 h-6 w-px bg-white/20" />
              <button
                type="button"
                onClick={handleHighlight}
                className="whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white"
              >
                Subrayar
              </button>
              <button
                type="button"
                onClick={() => setComposingNote(true)}
                className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
              >
                <StickyNote size={12} />
                Nota
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          ) : (
            <div>
              <textarea
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Escribe tu nota sobre este fragmento..."
                rows={3}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setComposingNote(false)}
                  className="rounded-full px-2.5 py-1.5 text-xs font-medium text-white/50 hover:bg-white/10"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSaveWithNote}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white"
                >
                  <Check size={13} />
                  Subrayar y guardar nota
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
