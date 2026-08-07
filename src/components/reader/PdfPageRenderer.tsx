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
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
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
