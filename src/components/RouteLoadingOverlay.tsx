"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Armchair } from "lucide-react";

export default function RouteLoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 550);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      aria-hidden
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-[0_2px_14px_-2px_rgba(229,9,20,0.65)]">
          <Armchair size={26} className="text-white" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}
