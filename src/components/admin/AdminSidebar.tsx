"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ArrowLeftCircle,
  Armchair,
  AlertTriangle,
  Crown,
  Database,
  BookOpen,
  Megaphone,
  Tag,
  Newspaper,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Libros", href: "/admin/libros", icon: BookOpen },
  { label: "Autores literarios", href: "/admin/libros-autores", icon: Users },
  { label: "Reportes de libros", href: "/admin/libros-reportes", icon: AlertTriangle },
  { label: "Ventas de libros", href: "/admin/libros-ventas", icon: Crown },
  { label: "Etiquetas", href: "/admin/etiquetas", icon: Tag },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Premium", href: "/admin/premium", icon: Crown },
  { label: "Anuncios", href: "/admin/anuncios", icon: Megaphone },
  { label: "Colaboradores", href: "/admin/colaboradores", icon: Users },
  { label: "Respaldo", href: "/admin/respaldo", icon: Database },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export default function AdminSidebar({
  premiumRequestsCount,
  bookReportsCount = 0,
}: {
  premiumRequestsCount: number;
  bookReportsCount?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/10 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover">
          <Armchair size={18} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="text-lg font-black text-white">
          Buta<span className="text-accent">kia</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const badgeCount =
            item.href === "/admin/premium"
              ? premiumRequestsCount
              : item.href === "/admin/libros-reportes"
                ? bookReportsCount
                : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} />
                {item.label}
              </span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="flex items-center gap-2.5 border-t border-white/10 px-5 py-4 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeftCircle size={17} />
        Volver al sitio
      </Link>
    </aside>
  );
}
