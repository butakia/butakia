"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, Highlighter, X, List as ListIcon, Maximize, Minimize } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { Book, BookChapter, SiteSettings } from "@/lib/types";
import Logo from "../Logo";
import { saveReadingProgressAction, saveReaderPreferenceAction, ReaderPreferenceInput, toggleBookFavoriteAction } from "@/lib/books-actions";
import ReaderControls, { ReaderPrefs } from "./ReaderControls";
import PdfPageRenderer from "./PdfPageRenderer";
import HighlightableText from "./HighlightableText";
import NotesPanel from "./NotesPanel";
import BookFinishedScreen from "./BookFinishedScreen";
import CelebrationModal from "./CelebrationModal";
import ShareRow from "./ShareRow";
import DonateButtons from "../DonateButtons";
import { playPageFlipSound, unlockPageFlipSound } from "@/lib/reader/pageFlipSound";
import { estimateCharsPerPage, paginateText, paginateByMeasurement } from "@/lib/reader/paginate";
import PosterPlaceholder from "../PosterPlaceholder";

const THEME_STYLES: Record<ReaderPrefs["theme"], { bg: string; text: string }> = {
  dark: { bg: "#141414", text: "#eaeaea" },
  sepia: { bg: "#f1e7d0", text: "#3a2f22" },
  light: { bg: "#ffffff", text: "#1a1a1a" },
};

const TEXT_WIDTH: Record<ReaderPrefs["textWidth"], string> = {
  narrow: "max-w-md",
  normal: "max-w-xl",
  wide: "max-w-3xl",
};

// Upper bound on the flip book's width per text-width setting — the *actual* width used
// is whatever the wrapper really measures at (ResizeObserver below), capped by this, so
// it's always correct for the real device instead of a guessed desktop number.
const TEXT_WIDTH_MAX: Record<ReaderPrefs["textWidth"], number> = {
  narrow: 420,
  normal: 560,
  wide: 720,
};

// Only used for the very first render, before the ResizeObserver reports the real box —
// superseded within one frame on the client.
const FALLBACK_SIZE = { width: 340, height: 480 };

const PAPER_SHADOW: Record<ReaderPrefs["theme"], string> = {
  dark: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px -6px rgba(0,0,0,0.6)",
  sepia: "inset 0 0 0 1px rgba(58,47,34,0.15), 0 8px 24px -6px rgba(58,47,34,0.35)",
  light: "inset 0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px -6px rgba(0,0,0,0.25)",
};

const DEFAULT_PREFS: ReaderPrefs = {
  mode: "flip",
  theme: "dark",
  fontSize: 18,
  lineHeight: 1.5,
  fontFamily: "serif",
  textWidth: "normal",
  textAlign: "left",
  soundEnabled: true,
};

interface HighlightItem {
  id: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text?: string;
  color?: string;
  note?: string | null;
}

interface FlipSubPage {
  chapterId: string;
  title?: string;
  content: string;
  offsetBase: number;
}

function ChapterContent({
  chapter,
  isHtml,
  isPlainText,
  bookId,
  highlights,
  onHighlightCreated,
  onHighlightRemoved,
  onNoteChange,
  activeHighlightId,
}: {
  chapter: BookChapter;
  isHtml: boolean;
  isPlainText: boolean;
  bookId: string;
  highlights: HighlightItem[];
  onHighlightCreated?: (h: HighlightItem) => void;
  onHighlightRemoved?: (id: string) => void;
  onNoteChange?: (id: string, note: string | null) => void;
  activeHighlightId?: string | null;
}) {
  if (isHtml) {
    return (
      <div
        className="prose prose-invert max-w-none"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
    );
  }
  if (isPlainText) {
    return (
      <HighlightableText
        bookId={bookId}
        chapterId={chapter.id}
        content={chapter.content}
        initialHighlights={highlights.filter((h) => h.chapterId === chapter.id)}
        onHighlightCreated={onHighlightCreated}
        onHighlightRemoved={onHighlightRemoved}
        onNoteChange={onNoteChange}
        activeHighlightId={activeHighlightId}
      />
    );
  }
  return <div className="whitespace-pre-wrap">{chapter.content}</div>;
}

function CoverPage({ book, theme }: { book: Book; theme: { bg: string; text: string } }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <PosterPlaceholder seed={book.cover || book.slug} title="" className="h-full w-full" icon="book" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6 text-white">
        <h1 className="text-xl font-black leading-tight">{book.title}</h1>
        {book.subtitle && <p className="text-sm text-white/80">{book.subtitle}</p>}
        <div className="mt-2 flex flex-col gap-0.5 text-xs text-white/70">
          <p>{book.authorName}</p>
          {(book.publisher || book.year) && (
            <p>
              {book.publisher}
              {book.publisher && book.year ? " · " : ""}
              {book.year}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookReader({
  book,
  chapters,
  initialPage,
  hasProgress = false,
  initialPrefs,
  initialHighlights = [],
  initialFavorited = false,
  siteSettings,
}: {
  book: Book;
  chapters: BookChapter[];
  initialPage: number;
  hasProgress?: boolean;
  initialPrefs: Partial<ReaderPrefs>;
  initialHighlights?: HighlightItem[];
  initialFavorited?: boolean;
  siteSettings?: SiteSettings;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<ReaderPrefs>({ ...DEFAULT_PREFS, ...initialPrefs });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPdf = book.contentType === "pdf";

  const isHtml = book.contentType === "richtext";
  const isPlainText = book.contentType === "text";

  // For the flip book, each chapter is split into as many fixed-size sub-pages as it
  // takes to fit without internal scrolling — a real page-turn needs a fixed page size,
  // there's no room for a nested scrollable area to fight the drag gesture over.
  //
  // The initial split uses a character-count formula (fast, SSR-safe, but only an
  // estimate — real font metrics vary by device/browser). Right after mount, a DOM
  // measurement pass below re-paginates against the exact same box the reader renders,
  // which is what actually eliminates overflowing/stray lines and empty pages.
  const buildHeuristicSubPages = (): FlipSubPage[] => {
    if (isPdf) return [];
    const charsPerPage = estimateCharsPerPage({
      pageWidth: FALLBACK_SIZE.width,
      pageHeight: FALLBACK_SIZE.height,
      fontSize: prefs.fontSize,
      lineHeight: prefs.lineHeight,
      hasTitle: true,
    });
    const result: FlipSubPage[] = [];
    for (const c of chapters) {
      if (!isPlainText) {
        result.push({ chapterId: c.id, title: c.title ?? undefined, content: c.content, offsetBase: 0 });
        continue;
      }
      const textPages = paginateText(c.content, charsPerPage);
      textPages.forEach((tp, i) => {
        result.push({ chapterId: c.id, title: i === 0 ? c.title ?? undefined : undefined, content: tp.content, offsetBase: tp.offsetBase });
      });
    }
    return result;
  };

  const [subPages, setSubPages] = useState<FlipSubPage[]>(buildHeuristicSubPages);

  const totalContentPages = isPdf ? book.pageCount || 1 : subPages.length || 1;

  // Flip-book page index: for text/richtext books, index 0 is the synthetic cover page and
  // the very last index is a synthetic "finished" page, so content page N lives at flip
  // index N + 1. PDFs have no synthetic cover/end page.
  const [currentFlipPage, setCurrentFlipPage] = useState(
    isPdf ? initialPage : hasProgress ? Math.min(initialPage, totalContentPages - 1) + 1 : 0
  );
  // The value above is only computed once, against the *heuristic* pagination guess
  // (buildHeuristicSubPages, based on a generic fallback box size) — the real
  // measurement pass below almost always produces a different total page count once
  // it knows the actual on-screen box. For a book with saved progress deep into a long
  // text, that mismatch could point `currentFlipPage` at an index past the end of the
  // *real* page list once react-pageflip remounts against it, which rendered as a
  // blank/black page (nothing at that index) instead of the actual saved position.
  // Re-clamping whenever the real total changes keeps it always in range.
  const initialPageRef = useRef(initialPage);
  useEffect(() => {
    if (isPdf || !hasProgress) return;
    setCurrentFlipPage(Math.min(initialPageRef.current, totalContentPages - 1) + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalContentPages, isPdf, hasProgress]);
  // Starts false on both server and client so the very first client render matches the
  // server-rendered HTML — the localStorage-backed real value is only knowable client-side,
  // so it's applied a moment later in an effect instead of a lazy initializer (which ran
  // this same check during hydration too, and mismatched whenever the flag was already set).
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  useEffect(() => {
    if (prefs.mode !== "flip") return;
    if (!window.localStorage.getItem("butakia:reader-swipe-hint-opt-out")) setShowSwipeHint(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Tracks the page index reported the last time reportProgress ran, so a "flip" event
  // that reports the *same* index (react-pageflip fires these on its own while setting
  // up — sometimes more than once, and not always within a fixed time of mounting) can
  // be told apart from a genuine page turn without guessing at timing.
  const lastReportedFlipIndexRef = useRef<number | null>(null);
  const [dontShowSwipeHintAgain, setDontShowSwipeHintAgain] = useState(false);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [showSaveCelebration, setShowSaveCelebration] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [showFavoriteCelebration, setShowFavoriteCelebration] = useState(false);
  const toggleFavorite = () => {
    toggleBookFavoriteAction(book.id)
      .then((result) => {
        setFavorited(result.favorited);
        if (result.favorited) setShowFavoriteCelebration(true);
      })
      .catch(() => {
        // Not logged in (the action throws) — the heart otherwise silently did nothing,
        // which read as "favoriting is broken" since there was no feedback at all.
        router.push("/login");
      });
  };
  // react-pageflip touches the DOM/window on construction, so the flip book only
  // renders after mount (a static import would otherwise blow up during SSR) — this
  // also keeps ref-forwarding intact, which next/dynamic's lazy wrapper was silently
  // swallowing (flipBookRef.current was always null through it).
  const [mounted, setMounted] = useState(false);
  const flipBookRef = useRef<any>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipWrapperRef = useRef<HTMLDivElement>(null);
  // The real, on-screen size of the page box — measured directly instead of assumed, since
  // react-pageflip stretches to fit whatever the parent allows and that real size varies a
  // lot device to device. Pagination and the flip book's own width/height props are both
  // driven off this, so there's a single source of truth instead of two guesses that can
  // drift apart (which was producing wildly different page counts between attempts).
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  // Highlighting needs native touch text-selection, which "touch-action: none" (below)
  // deliberately blocks so the page-turn gesture doesn't fight the browser for the touch.
  // This mode temporarily hands touch back to the browser so long-press-to-select works,
  // and pauses the flip gesture so it can't fire mid-selection.
  const [highlightMode, setHighlightMode] = useState(false);
  const highlightModeRef = useRef(false);
  const [allHighlights, setAllHighlights] = useState<HighlightItem[]>(initialHighlights);
  const [showHighlightsList, setShowHighlightsList] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const handleHighlightCreated = (h: HighlightItem) => {
    setAllHighlights((prev) => [...prev, h]);
    setHighlightMode(false);
  };
  const handleHighlightRemoved = (id: string) => {
    setAllHighlights((prev) => prev.filter((h) => h.id !== id));
  };
  const handleNoteChange = (id: string, note: string | null) => {
    setAllHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, note } : h)));
  };
  const jumpToHighlight = (h: HighlightItem) => {
    if (prefs.mode === "flip") {
      const idx = subPages.findIndex(
        (sp) => sp.chapterId === h.chapterId && h.startOffset >= sp.offsetBase && h.startOffset < sp.offsetBase + sp.content.length
      );
      if (idx !== -1) flipBookRef.current?.pageFlip()?.turnToPage(idx + 1);
    }
    setShowHighlightsList(false);
    setActiveHighlightId(h.id);
    setTimeout(() => setActiveHighlightId(null), 3000);
  };
  useEffect(() => {
    highlightModeRef.current = highlightMode;
  }, [highlightMode]);

  // On desktop (mouse/trackpad) there's no long-press gesture and no reason to steal
  // mousedown for page-drag — the arrow buttons handle navigation instead, which frees
  // up plain click-and-drag for native text selection, and lets us skip the manual
  // "enter highlight mode, then tap Subrayar" flow entirely: selecting text just
  // highlights it immediately.
  const [isFinePointer, setIsFinePointer] = useState(false);
  const isFinePointerRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mq.matches);
    isFinePointerRef.current = mq.matches;
  }, []);

  useEffect(() => setMounted(true), []);
  useEffect(() => unlockPageFlipSound(), []);

  const theme = THEME_STYLES[prefs.theme];

  useEffect(() => {
    if (!showSwipeHint) return;
    const timer = setTimeout(() => dismissSwipeHint(), 8000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSwipeHint]);

  const dismissSwipeHint = () => {
    setShowSwipeHint(false);
    if (dontShowSwipeHintAgain) window.localStorage.setItem("butakia:reader-swipe-hint-opt-out", "1");
  };

  // The real, on-screen box size — measured directly on our own wrapper (not the
  // library's internal element), so it's known *before* the flip book even mounts and
  // stays in sync with rotation/fullscreen/textWidth changes. Small (<4px) jitter from
  // mobile browsers resizing the viewport on scroll (address bar show/hide) is ignored
  // so it doesn't force constant flip-book remounts while reading.
  const lastMeasuredSizeRef = useRef<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const el = flipWrapperRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      const last = lastMeasuredSizeRef.current;
      // Compared against a ref (not the `containerSize` state) so this never calls
      // setState with a "new" object carrying the same numbers — that was creating a
      // fresh {width,height} on every single ResizeObserver tick regardless of whether
      // anything actually changed, which fed a render loop (React's "Maximum update
      // depth exceeded") between this effect and the pagination effect below.
      if (last && Math.abs(last.width - width) < 4 && Math.abs(last.height - height) < 4) return;
      lastMeasuredSizeRef.current = { width, height };
      setContainerSize({ width, height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFullscreen, prefs.textWidth]);

  // react-pageflip's own drag system makes the page visually "follow the finger" while
  // dragging, then picks a fold corner (top/bottom) based on exactly where the touch
  // landed — this is what caused inconsistent-looking flips and corner mis-clicks no
  // matter how the touch zone was tuned. Instead of fighting that system, we bypass it
  // entirely: our own listeners just measure a plain swipe (start point, end point,
  // elapsed time) and, if it qualifies, call the library's own flipNext()/flipPrev()
  // directly — a fixed, canned animation that always looks the same, with no
  // finger-tracking and no corner ambiguity at all.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let attachedEl: HTMLElement | null = null;
    let ownTouchStartListener: ((e: TouchEvent) => void) | null = null;
    let ownTouchEndListener: ((e: TouchEvent) => void) | null = null;
    let ownMouseDownListener: ((e: MouseEvent) => void) | null = null;
    let ownMouseUpListener: ((e: MouseEvent) => void) | null = null;

    // A generous central band and edge columns — the swipe only needs to *start* here,
    // so this just keeps accidental gestures from the reading area (where users select
    // text) or from the very top/bottom (reaching for controls) from being misread.
    const BAND_TOP = 0.25;
    const BAND_BOTTOM = 0.75;
    const inBand = (y: number, height: number) => y >= height * BAND_TOP && y <= height * BAND_BOTTOM;
    const EDGE_WIDTH = 0.22;
    const zoneFor = (x: number, width: number): "left" | "right" | null => {
      if (x <= width * EDGE_WIDTH) return "left";
      if (x >= width * (1 - EDGE_WIDTH)) return "right";
      return null;
    };

    const SWIPE_DISTANCE = 30;
    const SWIPE_MAX_DRIFT = 60;
    const SWIPE_MAX_TIME = 1500;

    // Buttons living inside a flip page (favoritos, compartir, subrayar, the "Entendido"
    // dismiss...) need normal clicks — without this, every tap on them would be read as
    // a swipe attempt instead.
    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement && !!target.closest("button, a, input, label, select, textarea");

    // Polling with setTimeout rather than requestAnimationFrame — rAF callbacks can be
    // paused by the browser while the tab isn't the foreground/visible one, which would
    // otherwise stall this indefinitely if the page finishes loading in a backgrounded tab.
    const tryPatch = () => {
      if (cancelled) return;
      const app = flipBookRef.current?.pageFlip?.();
      const ui = app?.getUI?.() as (Record<string, unknown> & { getDistElement?: () => HTMLElement }) | undefined;
      const distEl = ui?.getDistElement?.();
      if (app && ui && distEl) {
        // Fully remove the library's own drag-to-follow listeners — we never call
        // startUserTouch, so these would otherwise still fight our own gesture handling.
        const originalTouchStart = ui.onTouchStart as EventListener | undefined;
        if (originalTouchStart) distEl.removeEventListener("touchstart", originalTouchStart);
        const originalMouseDown = ui.onMouseDown as EventListener | undefined;
        if (originalMouseDown) distEl.removeEventListener("mousedown", originalMouseDown);

        let start: { x: number; y: number; time: number; zone: "left" | "right" } | null = null;

        ownTouchStartListener = (e: TouchEvent) => {
          if (highlightModeRef.current) return; // let the browser handle text selection instead
          if (isInteractiveTarget(e.target)) return;
          if (e.touches.length === 0) return;
          const t = e.touches[0];
          const rect = distEl.getBoundingClientRect();
          const x = t.clientX - rect.left;
          const y = t.clientY - rect.top;
          if (!inBand(y, rect.height)) return;
          const zone = zoneFor(x, rect.width);
          if (!zone) return;
          start = { x, y, time: Date.now(), zone };
        };
        distEl.addEventListener("touchstart", ownTouchStartListener, { passive: true });

        ownTouchEndListener = (e: TouchEvent) => {
          if (!start || e.changedTouches.length === 0) return;
          const t = e.changedTouches[0];
          const rect = distEl.getBoundingClientRect();
          const dx = t.clientX - rect.left - start.x;
          const dy = t.clientY - rect.top - start.y;
          const elapsed = Date.now() - start.time;
          start = null;
          if (Math.abs(dy) > SWIPE_MAX_DRIFT || elapsed > SWIPE_MAX_TIME || Math.abs(dx) < SWIPE_DISTANCE) return;
          setShowSwipeHint(false);
          if (dx < 0) app.flipNext();
          else app.flipPrev();
        };
        distEl.addEventListener("touchend", ownTouchEndListener);

        let mouseStart: { x: number; y: number; time: number } | null = null;
        ownMouseDownListener = (e: MouseEvent) => {
          if (highlightModeRef.current || isFinePointerRef.current) return;
          if (isInteractiveTarget(e.target)) return;
          const rect = distEl.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (!inBand(y, rect.height) || !zoneFor(x, rect.width)) return;
          mouseStart = { x, y, time: Date.now() };
        };
        distEl.addEventListener("mousedown", ownMouseDownListener);

        ownMouseUpListener = (e: MouseEvent) => {
          if (!mouseStart) return;
          const rect = distEl.getBoundingClientRect();
          const dx = e.clientX - rect.left - mouseStart.x;
          const dy = e.clientY - rect.top - mouseStart.y;
          const elapsed = Date.now() - mouseStart.time;
          mouseStart = null;
          if (Math.abs(dy) > SWIPE_MAX_DRIFT || elapsed > SWIPE_MAX_TIME || Math.abs(dx) < SWIPE_DISTANCE) return;
          setShowSwipeHint(false);
          if (dx < 0) app.flipNext();
          else app.flipPrev();
        };
        window.addEventListener("mouseup", ownMouseUpListener);

        attachedEl = distEl;
        return;
      }
      timer = setTimeout(tryPatch, 50);
    };
    tryPatch();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (ownMouseUpListener) window.removeEventListener("mouseup", ownMouseUpListener);
      if (attachedEl && ownTouchStartListener) attachedEl.removeEventListener("touchstart", ownTouchStartListener);
      if (attachedEl && ownTouchEndListener) attachedEl.removeEventListener("touchend", ownTouchEndListener);
      if (attachedEl && ownMouseDownListener) attachedEl.removeEventListener("mousedown", ownMouseDownListener);
    };
  }, [containerSize, isFullscreen, prefs.theme, prefs.fontSize, prefs.lineHeight, prefs.fontFamily, prefs.textWidth]);

  // Paginates against a hidden clone of the *real* page markup (same classes, same
  // nesting, same title element) mounted inside the real wrapper — not a generic
  // synthetic div approximating the box. A plain approximation kept drifting from what
  // actually renders (padding/line-height assumptions that don't always hold, e.g. a
  // two-line chapter title), which showed up as pages cut short with text in the top
  // half and the rest blank. Measuring the literal same DOM structure the reader uses
  // removes that whole category of drift — the browser is the source of truth, not a
  // guess about how big a title or paragraph gap ends up being.
  useEffect(() => {
    if (isPdf || !isPlainText || !containerSize) return;

    const charsPerPage = estimateCharsPerPage({
      pageWidth: containerSize.width,
      pageHeight: containerSize.height,
      fontSize: prefs.fontSize,
      lineHeight: prefs.lineHeight,
      hasTitle: true,
    });

    const outer = document.createElement("div");
    outer.className = "flex flex-col rounded-sm p-6";
    // Fixed + off-screen in <body>, not inside flipWrapperRef — appending there fed
    // back into the ResizeObserver watching that same element (each append/remove
    // nudging its measured size, which retriggered this effect via `containerSize`,
    // which mutated the DOM again... a real infinite loop, "Maximum update depth
    // exceeded"). Measuring in a wholly separate part of the DOM avoids that entirely.
    outer.style.position = "fixed";
    outer.style.top = "0";
    outer.style.left = "-9999px";
    outer.style.width = `${containerSize.width}px`;
    outer.style.height = `${containerSize.height}px`;
    outer.style.visibility = "hidden";
    outer.style.pointerEvents = "none";
    outer.style.overflow = "hidden";

    const titleEl = document.createElement("h2");
    titleEl.className = "mb-3 shrink-0 text-lg font-bold";
    outer.appendChild(titleEl);

    const fontWrapper = document.createElement("div");
    fontWrapper.style.fontSize = `${prefs.fontSize}px`;
    fontWrapper.style.lineHeight = `${prefs.lineHeight}`;
    fontWrapper.style.fontFamily = prefs.fontFamily;
    outer.appendChild(fontWrapper);

    const textEl = document.createElement("div");
    textEl.className = "relative whitespace-pre-wrap"; // matches HighlightableText's root div
    fontWrapper.appendChild(textEl);

    document.body.appendChild(outer);

    const fits = (text: string, isFirstOfChapter: boolean, title: string | undefined): boolean => {
      titleEl.style.display = isFirstOfChapter && title ? "" : "none";
      titleEl.textContent = isFirstOfChapter ? title ?? "" : "";
      textEl.textContent = text;
      return outer.scrollHeight <= outer.clientHeight;
    };

    const result: FlipSubPage[] = [];
    for (const c of chapters) {
      const textPages = paginateByMeasurement(
        c.content,
        (text, isFirstOfChapter) => fits(text, isFirstOfChapter, c.title ?? undefined),
        charsPerPage
      );
      textPages.forEach((tp, i) => {
        result.push({ chapterId: c.id, title: i === 0 ? c.title ?? undefined : undefined, content: tp.content, offsetBase: tp.offsetBase });
      });
    }

    document.body.removeChild(outer);
    setSubPages(result);
  }, [isPdf, isPlainText, chapters, containerSize, prefs.fontSize, prefs.lineHeight, prefs.fontFamily]);

  const updatePrefs = (next: Partial<ReaderPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...next }));
    saveReaderPreferenceAction(next as ReaderPreferenceInput);
  };

  // The very first time someone opens the reader (no ReaderPreference row saved yet —
  // `initialPrefs` came back empty from the server), it always fell back to the same
  // small, mobile-sized defaults (18px font, "normal" width) regardless of the actual
  // screen. On a big desktop monitor that reads as "the text looks wrong" even though
  // nothing is technically broken — it's just never scaled up. This runs once, only
  // for that first-visit case, and only on desktop-sized windows, to pick better
  // defaults; anything the user has ever explicitly saved (`initialPrefs` non-empty)
  // is left completely alone.
  const hasAutoAdaptedRef = useRef(false);
  useEffect(() => {
    if (hasAutoAdaptedRef.current) return;
    hasAutoAdaptedRef.current = true;
    if (Object.keys(initialPrefs).length > 0) return;
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width >= 1600) {
      updatePrefs({ fontSize: 22, lineHeight: 1.6, textWidth: "wide" });
    } else if (width >= 1024) {
      updatePrefs({ fontSize: 20, lineHeight: 1.55, textWidth: "normal" });
    }
    // Narrower than 1024px (tablet/mobile) keeps the existing 18px default, which was
    // already tuned for small screens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen API unsupported or blocked; ignore.
    }
  };

  const contentIndexFor = (flipIndex: number) => (isPdf ? flipIndex : Math.max(0, flipIndex - 1));

  const persistProgress = (flipIndex: number) => {
    const contentIndex = Math.min(contentIndexFor(flipIndex), totalContentPages - 1);
    const percent = Math.min(100, Math.round(((contentIndex + 1) / totalContentPages) * 100));
    saveReadingProgressAction(book.id, contentIndex, percent);
  };

  const reportProgress = (flipIndex: number) => {
    // react-pageflip fires its own synthetic "flip" event(s) while setting up the start
    // page — not real page turns — and it can do this more than once (e.g. once per
    // remount as the book's real on-screen size settles), so neither "skip the first
    // call" nor "skip anything within N ms of mount" reliably tells them apart from a
    // real flip. What does: a real flip always changes the reported page index; these
    // synthetic ones just re-report whatever page was already showing.
    const isRealFlip = lastReportedFlipIndexRef.current !== null && flipIndex !== lastReportedFlipIndexRef.current;
    lastReportedFlipIndexRef.current = flipIndex;
    if (!isRealFlip) {
      setCurrentFlipPage(flipIndex);
      return;
    }
    if (prefs.soundEnabled) playPageFlipSound();
    setCurrentFlipPage(flipIndex);
    if (showSwipeHint) dismissSwipeHint();

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistProgress(flipIndex), 1500);
  };

  const [seekValue, setSeekValue] = useState<number | null>(null);
  const commitSeek = () => {
    if (seekValue === null) return;
    const flipIndex = isPdf ? seekValue : seekValue + 1;
    flipBookRef.current?.pageFlip()?.turnToPage(flipIndex);
    setSeekValue(null);
  };

  const saveBookmarkNow = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    persistProgress(currentFlipPage);
    setBookmarkSaved(true);
    setShowSaveCelebration(true);
    setTimeout(() => setBookmarkSaved(false), 1800);
  };

  const pages = useMemo(() => {
    if (isPdf) {
      return Array.from({ length: totalContentPages }, (_, i) => i + 1);
    }
    return chapters;
  }, [isPdf, chapters, totalContentPages]);

  const contentIndex = Math.min(contentIndexFor(currentFlipPage), totalContentPages - 1);
  const progressPercent = Math.min(100, Math.round(((contentIndex + 1) / totalContentPages) * 100));
  const pagesRemaining = Math.max(0, totalContentPages - (contentIndex + 1));

  const flipPages = useMemo(() => {
    if (isPdf) {
      return (pages as number[]).map((p) => (
        <div key={p} className="h-full w-full">
          <PdfPageRenderer pdfUrl={book.pdfUrl!} pageNumber={p} />
        </div>
      ));
    }
    const contentPages = subPages.map((sp, i) => (
      <div key={`${sp.chapterId}-${i}`} className="h-full w-full overflow-hidden">
        {/* react-pageflip mutates the inline style of this outer div directly
            (forces display:block and wipes any style we set, including
            background/color), so ALL real styling lives on this inner div instead. */}
        <div
          className="flex h-full w-full flex-col rounded-sm p-6"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: theme.bg,
            color: theme.text,
            boxShadow: PAPER_SHADOW[prefs.theme],
          }}
        >
          {sp.title && <h2 className="mb-3 shrink-0 text-lg font-bold">{sp.title}</h2>}
          <div style={{ fontSize: prefs.fontSize, lineHeight: prefs.lineHeight, fontFamily: prefs.fontFamily, textAlign: prefs.textAlign }}>
            {isPlainText ? (
              <HighlightableText
                bookId={book.id}
                chapterId={sp.chapterId}
                content={sp.content}
                offsetBase={sp.offsetBase}
                initialHighlights={allHighlights.filter((h) => h.chapterId === sp.chapterId)}
                onHighlightCreated={handleHighlightCreated}
                onHighlightRemoved={handleHighlightRemoved}
                onNoteChange={handleNoteChange}
                activeHighlightId={activeHighlightId}
                autoHighlight={isFinePointer}
              />
            ) : isHtml ? (
              // eslint-disable-next-line react/no-danger
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sp.content }} />
            ) : (
              <div className="whitespace-pre-wrap">{sp.content}</div>
            )}
          </div>
        </div>
      </div>
    ));
    return [
      <div key="cover" className="h-full w-full overflow-hidden">
        <CoverPage book={book} theme={theme} />
      </div>,
      ...contentPages,
      <div key="finished" className="h-full w-full overflow-hidden">
        <BookFinishedScreen
          book={book}
          theme={theme}
          initialFavorited={initialFavorited}
          highlights={allHighlights.filter((h): h is HighlightItem & { text: string } => Boolean(h.text))}
          onRestart={() => flipBookRef.current?.pageFlip()?.turnToPage(0)}
        />
      </div>,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPdf, isPlainText, isHtml, pages, subPages, theme, prefs.theme, prefs.fontSize, prefs.lineHeight, prefs.fontFamily, prefs.textAlign, book, allHighlights, initialFavorited, isFinePointer, activeHighlightId]);

  const highlightControls = isPlainText && !isPdf && (
    <div className="relative flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => setShowHighlightsList((v) => !v)}
        aria-label="Ver mis notas y subrayados"
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          showHighlightsList ? "bg-accent text-white" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        <ListIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => setHighlightMode((v) => !v)}
        aria-label={highlightMode ? "Salir del modo subrayado" : "Subrayar texto"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          highlightMode ? "bg-accent text-white" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {highlightMode ? <X size={15} /> : <Highlighter size={15} />}
      </button>
    </div>
  );

  const notesPanel = (
    <NotesPanel
      open={showHighlightsList}
      onClose={() => setShowHighlightsList(false)}
      highlights={allHighlights}
      onJumpTo={jumpToHighlight}
    />
  );

  if (prefs.mode === "scroll") {
    return (
      <div ref={containerRef} className={`flex flex-col gap-6 ${isFullscreen ? "h-screen overflow-y-auto bg-black p-6" : ""}`}>
        {notesPanel}
        <div className="flex items-center justify-between gap-3">
          <ReaderControls
            prefs={prefs}
            onChange={updatePrefs}
            onSaveBookmark={saveBookmarkNow}
            bookmarkSaved={bookmarkSaved}
            favorited={favorited}
            onToggleFavorite={toggleFavorite}
          />
          {highlightControls}
        </div>
        <div
          className={`mx-auto w-full ${TEXT_WIDTH[prefs.textWidth]} rounded-xl p-6 md:p-10`}
          style={{ background: theme.bg, color: theme.text }}
        >
          {isPdf ? (
            <div className="flex flex-col gap-8">
              {pages.map((p) => (
                <div key={p as number} className="aspect-[3/4] w-full">
                  <PdfPageRenderer pdfUrl={book.pdfUrl!} pageNumber={p as number} />
                </div>
              ))}
            </div>
          ) : (
            (pages as BookChapter[]).map((c) => (
              <div
                key={c.id}
                className="mb-10"
                style={{ fontSize: prefs.fontSize, lineHeight: prefs.lineHeight, fontFamily: prefs.fontFamily, textAlign: prefs.textAlign }}
              >
                {c.title && <h2 className="mb-3 text-xl font-bold">{c.title}</h2>}
                <ChapterContent
                  chapter={c}
                  isHtml={isHtml}
                  isPlainText={isPlainText}
                  bookId={book.id}
                  highlights={allHighlights}
                  onHighlightCreated={handleHighlightCreated}
                  onHighlightRemoved={handleHighlightRemoved}
                  onNoteChange={handleNoteChange}
                  activeHighlightId={activeHighlightId}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center gap-2 md:gap-4 ${isFullscreen ? "h-screen justify-center bg-black gap-0" : ""}`}
      // The flip book needs a bounded height to size itself against (via the
      // ResizeObserver on flipWrapperRef below) — set directly here instead of relying
      // on the page wrapper to provide one, since that wrapper is shared with scroll
      // mode, which needs the opposite (natural, unbounded height so the page can
      // flow normally instead of this box's content overflowing on top of whatever
      // comes after it, like the comments section).
      style={isFullscreen ? undefined : { height: "min(88dvh, 900px)" }}
    >
      {notesPanel}
      {isFullscreen ? (
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Salir de pantalla completa"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
          </button>
          <Logo iconOnly className="opacity-80" />
          {highlightControls || <div className="w-9" aria-hidden />}
        </div>
      ) : (
        <>
          <div className="w-full shrink-0">
            <ReaderControls
              prefs={prefs}
              onChange={updatePrefs}
              onSaveBookmark={saveBookmarkNow}
              bookmarkSaved={bookmarkSaved}
              favorited={favorited}
              onToggleFavorite={toggleFavorite}
            />
          </div>

          <div className="flex w-full max-w-md shrink-0 items-center gap-3 text-xs text-white/60">
            <div className="relative flex h-4 flex-1 items-center" title="Arrastra para ir a otra página">
              <div className="pointer-events-none absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                  style={{
                    width: `${
                      seekValue !== null ? (seekValue / Math.max(1, totalContentPages - 1)) * 100 : progressPercent
                    }%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalContentPages - 1)}
                value={seekValue ?? contentIndex}
                onChange={(e) => setSeekValue(Number(e.target.value))}
                onMouseUp={commitSeek}
                onTouchEnd={commitSeek}
                onKeyUp={commitSeek}
                aria-label="Arrastra para ir a una página específica"
                title="Arrastra para ir a otra página"
                className="reader-seek absolute inset-0 h-full w-full cursor-pointer bg-transparent"
              />
            </div>
            <span className="shrink-0">
              {pagesRemaining === 0 ? "Última página" : `${pagesRemaining} ${pagesRemaining === 1 ? "página" : "páginas"} restantes`}
            </span>
            {highlightControls}
          </div>
        </>
      )}

      <div className="relative flex w-full min-h-0 flex-1 items-stretch justify-center">
        {/* Desktop-only click-to-turn arrows — the swipe gesture stays the primary way to
            turn pages on touch devices, but a mouse user on a big screen has no
            equivalent unless they discover the edge-drag zones, so an explicit arrow
            is a much more obvious affordance there. Hidden below the lg breakpoint so
            it never shows on tablets/phones. */}
        <button
          type="button"
          onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
          aria-label="Página anterior"
          style={{ left: containerSize ? `calc(50% - ${containerSize.width / 2 + 76}px)` : undefined }}
          className="group absolute left-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-accent/60 bg-accent/90 text-white shadow-[0_0_20px_-4px_rgba(229,9,20,0.65)] backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:bg-accent hover:shadow-[0_0_28px_-2px_rgba(229,9,20,0.9)] active:scale-95 lg:flex"
        >
          <ChevronLeft size={26} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
          aria-label="Página siguiente"
          style={{ right: containerSize ? `calc(50% - ${containerSize.width / 2 + 76}px)` : undefined }}
          className="group absolute right-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-accent/60 bg-accent/90 text-white shadow-[0_0_20px_-4px_rgba(229,9,20,0.65)] backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:bg-accent hover:shadow-[0_0_28px_-2px_rgba(229,9,20,0.9)] active:scale-95 lg:flex"
        >
          <ChevronRight size={26} className="text-white" />
        </button>

      <div
        ref={flipWrapperRef}
        className="relative mx-auto w-full min-h-0 flex-1 overflow-hidden"
        style={{
          // In fullscreen the surrounding screen is much bigger than the capped reading
          // width, so a user's natural swipe (anywhere across that big black canvas)
          // often landed outside the book element entirely — our gesture listeners are
          // attached to the book itself, so touches on the empty margins never reached
          // them, which read as "swiping doesn't work" in fullscreen specifically.
          // Widening the cap there closes most of that gap.
          maxWidth: isFullscreen ? Math.min(TEXT_WIDTH_MAX[prefs.textWidth] * 1.5, 900) : TEXT_WIDTH_MAX[prefs.textWidth],
          maxHeight: isFullscreen ? "94vh" : "820px",
          touchAction: highlightMode ? "pan-y" : "none",
        }}
      >
        {mounted && containerSize && (
          <HTMLFlipBook
            // react-pageflip only reads style/size props once, on mount — it never
            // re-renders its internal page DOM when these change. Forcing a remount via key
            // is the only reliable way to apply them, so we preserve the current page as the
            // new startPage to avoid jumping back to the beginning.
            key={`${prefs.theme}-${prefs.fontSize}-${prefs.lineHeight}-${prefs.fontFamily}-${prefs.textWidth}-${containerSize.width}x${containerSize.height}-${isFinePointer}-${allHighlights.length}`}
            ref={flipBookRef}
            width={containerSize.width}
            height={containerSize.height}
            minWidth={containerSize.width}
            maxWidth={containerSize.width}
            minHeight={containerSize.height}
            maxHeight={containerSize.height}
            size="fixed"
            startPage={Math.min(currentFlipPage, flipPages.length - 1)}
            drawShadow
            flippingTime={700}
            usePortrait
            startZIndex={10}
            autoSize={false}
            maxShadowOpacity={0.5}
            showCover={false}
            // Pages are now fixed-size (no internal scroll), so there's nothing for native
            // mobile scrolling to do inside the book — disabling this hands touch handling
            // to react-pageflip unconditionally instead of gating it behind a >10px
            // horizontal-delta check and an `e.cancelable` guard, which is what was making
            // drags starting away from a corner get stolen by the browser's own scroll
            // gesture detection (hence "only works from a corner" and "needs a few tries").
            mobileScrollSupport={false}
            clickEventForward={false}
            useMouseEvents={!isFinePointer}
            swipeDistance={20}
            showPageCorners={false}
            disableFlipByClick={false}
            className="mx-auto"
            style={{}}
            onFlip={(e: { data: number }) => reportProgress(e.data)}
          >
            {flipPages}
          </HTMLFlipBook>
        )}
      </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
        style={{ display: showSwipeHint ? "flex" : "none" }}
      >
        <div className="pointer-events-auto flex flex-col items-center gap-2.5 rounded-2xl border border-white/20 bg-black/85 px-4 py-3 text-center text-sm text-white shadow-lg backdrop-blur-md">
          <span className="flex items-center gap-2">
            <ChevronLeft size={16} className="shrink-0 text-accent" />
            Desliza desde el lateral central derecho para avanzar y desde el izquierdo para retroceder
            <ChevronRight size={16} className="shrink-0 text-accent" />
          </span>
          <label className="flex items-center gap-1.5 text-xs text-white/60">
            <input
              type="checkbox"
              checked={dontShowSwipeHintAgain}
              onChange={(e) => setDontShowSwipeHintAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            No volver a mostrar
          </label>
          <button
            type="button"
            onClick={dismissSwipeHint}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white"
          >
            Entendido
          </button>
        </div>
      </div>

      {showSaveCelebration && (
        <CelebrationModal
          title="¡Felicidades!"
          message="Has guardado tu progreso en el libro. Puedes continuar desde aquí la próxima vez que entres."
          onClose={() => setShowSaveCelebration(false)}
        />
      )}

      {showFavoriteCelebration && (
        <CelebrationModal
          title="¡Agregado a favoritos!"
          message={`"${book.title}" ya está en tu lista. Si te gustó, ayúdanos a que más gente lo descubra:`}
          onClose={() => setShowFavoriteCelebration(false)}
        >
          <div className="mt-2 flex w-full flex-col gap-4">
            <Link href="/libros#mis-favoritos" className="text-xs font-semibold text-accent hover:underline">
              Ver en Mi Lista →
            </Link>
            <ShareRow slug={book.slug} title={book.title} />
            {siteSettings && <DonateButtons settings={siteSettings} />}
          </div>
        </CelebrationModal>
      )}

      {!isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          title="Pantalla completa"
          className="absolute bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
        >
          <Maximize size={18} />
        </button>
      )}

      {highlightMode && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center px-6">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
            Mantén presionado y selecciona el texto que quieras subrayar
          </div>
        </div>
      )}

      <style jsx global>{`
        .reader-seek {
          -webkit-appearance: none;
          appearance: none;
        }
        .reader-seek::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: var(--accent, #e50914);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
          cursor: grab;
        }
        .reader-seek::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 9999px;
          background: var(--accent, #e50914);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
          cursor: grab;
        }
        .reader-seek::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
