"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function TagInput({
  value,
  onChange,
  placeholder = "Escribe y presiona Enter",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  return (
    <div>
      <div className={`${inputCls} flex flex-wrap items-center gap-1.5`}>
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-accent/70 hover:text-white"
              aria-label={`Quitar ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
