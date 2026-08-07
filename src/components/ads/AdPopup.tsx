"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdSlot } from "@/lib/ads-types";
import AdFrame from "./AdFrame";

const SESSION_KEY = "butakia:ad-popup-shown";
const SHOW_DELAY_MS = 2500;

export default function AdPopup({ ad }: { ad: AdSlot }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => setVisible(false)}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Cerrar anuncio"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
        >
          <X size={16} />
        </button>
        <AdFrame ad={ad} className="w-full" />
      </div>
    </div>
  );
}
