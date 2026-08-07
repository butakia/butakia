"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface BlurSelectOption {
  value: string;
  label: string;
  flag?: string;
}

export default function BlurSelect({
  options,
  value,
  onChange,
  placeholder = "Selecciona...",
  allowEmpty,
  emptyLabel = "Ninguno",
}: {
  options: BlurSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClickOutside = (e: Event) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-left text-sm text-white transition-colors hover:border-white/25 focus:border-accent focus:outline-none"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.flag && <span className="text-base leading-none">{selected.flag}</span>}
          <span className={selected ? "text-white" : "text-white/40"}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-white/50 hover:bg-white/10"
            >
              {emptyLabel}
              {!value && <Check size={14} className="text-accent" />}
            </button>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-white hover:bg-white/10"
            >
              <span className="flex items-center gap-2 truncate">
                {o.flag && <span className="text-base leading-none">{o.flag}</span>}
                {o.label}
              </span>
              {value === o.value && <Check size={14} className="shrink-0 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
