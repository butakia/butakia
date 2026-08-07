import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

export default function CrossPromoCard({
  icon: Icon,
  question,
  cta,
  href,
}: {
  icon: LucideIcon;
  question: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/20 via-accent/5 to-transparent px-6 py-5 transition-transform hover:scale-[1.01]"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Icon size={22} />
        </span>
        <div>
          <p className="text-lg font-bold text-white">{question}</p>
          <p className="text-sm text-white/60">{cta}</p>
        </div>
      </div>
      <ArrowRight size={22} className="shrink-0 text-accent transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
