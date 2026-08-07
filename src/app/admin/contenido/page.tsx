import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { getAllTitles } from "@/lib/data";
import AdminContentTable from "@/components/admin/AdminContentTable";

export default async function AdminContenidoPage() {
  const titles = await getAllTitles();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Contenido</h1>
          <p className="mt-1 text-sm text-white/50">{titles.length} títulos en el catálogo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/admin/export"
            download
            className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            <Download size={16} />
            Exportar catálogo (JSON)
          </a>
          <Link
            href="/admin/contenido/nuevo"
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Agregar título
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <AdminContentTable titles={titles} />
      </div>
    </div>
  );
}
