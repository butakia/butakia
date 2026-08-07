"use client";

import { useEffect, useRef, useState } from "react";

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsLibPromise;
}

// The flip-mode page box is otherwise sized for text reading (roughly fills the
// available height, width capped separately) — nothing like a real book page's
// proportions. Reading the actual PDF page's own width/height lets the reader
// size that box to match instead of stretching/squashing the page into a
// mismatched shape.
export async function getPdfPageAspectRatio(pdfUrl: string): Promise<number> {
  const pdfjsLib = await loadPdfJs();
  const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  return viewport.width / viewport.height;
}

export default function PdfPageRenderer({ pdfUrl, pageNumber }: { pdfUrl: string; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      try {
        const pdfjsLib = await loadPdfJs();
        const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        if (cancelled) return;
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        // The canvas's pixel buffer needs to match physical screen pixels, not CSS
        // pixels, or high-DPI screens (most laptops/phones today) stretch this low-res
        // bitmap to fill the display size and it comes out visibly blurry. Sizing the
        // buffer by devicePixelRatio while keeping the CSS size at the plain viewport
        // dimensions decouples "how sharp" from "how big it lays out".
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
        await page.render({ canvasContext: ctx, viewport, canvas, transform }).promise;
      } catch {
        // page failed to render; leave canvas blank
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, pageNumber]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      {loading && <span className="absolute text-xs text-black/40">Cargando página...</span>}
      <canvas ref={canvasRef} className="max-h-full max-w-full" />
    </div>
  );
}
