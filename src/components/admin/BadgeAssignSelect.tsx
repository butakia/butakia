"use client";

import { useTransition } from "react";
import { setContributorBadgeAction } from "@/lib/actions";

const OPTIONS = [
  { value: "", label: "Sin insignia" },
  { value: "bronze", label: "Cobre" },
  { value: "silver", label: "Plata" },
  { value: "gold", label: "Oro" },
];

export default function BadgeAssignSelect({
  contributorId,
  badge,
}: {
  contributorId: string;
  badge?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={badge ?? ""}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as "gold" | "silver" | "bronze" | "";
        startTransition(() => setContributorBadgeAction(contributorId, value || null));
      }}
      className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-accent focus:outline-none disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
