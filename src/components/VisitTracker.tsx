"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordVisitAction } from "@/lib/visits";

export default function VisitTracker() {
  const pathname = usePathname();
  const lastRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastRecordedRef.current === pathname) return;
    lastRecordedRef.current = pathname;
    recordVisitAction(pathname || "/");
  }, [pathname]);

  return null;
}
