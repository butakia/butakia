import { ShieldCheck } from "lucide-react";
import CrownIcon from "./CrownIcon";

const TIER_STYLE: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  gold: {
    bg: "bg-gradient-to-br from-yellow-400/25 to-yellow-600/10",
    text: "text-yellow-400",
    ring: "ring-yellow-400/40",
    label: "Colaborador Oro",
  },
  silver: {
    bg: "bg-gradient-to-br from-zinc-300/25 to-zinc-500/10",
    text: "text-zinc-300",
    ring: "ring-zinc-300/40",
    label: "Colaborador Plata",
  },
  bronze: {
    bg: "bg-gradient-to-br from-amber-600/25 to-amber-800/10",
    text: "text-amber-600",
    ring: "ring-amber-600/40",
    label: "Colaborador Bronce",
  },
};

export default function ContributorBadge({
  tier,
  isAdmin,
  size = "md",
}: {
  tier?: "gold" | "silver" | "bronze";
  isAdmin?: boolean;
  size?: "sm" | "md";
}) {
  if (isAdmin) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-accent ring-1 ring-accent/40 ${
          size === "sm" ? "text-[10px]" : "text-xs"
        } font-bold`}
      >
        <ShieldCheck size={size === "sm" ? 12 : 14} />
        Admin
      </span>
    );
  }

  if (!tier) return null;
  const style = TIER_STYLE[tier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${style.bg} ${style.text} ${style.ring} ${
        size === "sm" ? "text-[10px]" : "text-xs"
      } font-bold`}
    >
      <CrownIcon size={size === "sm" ? 12 : 14} />
      {style.label}
    </span>
  );
}
