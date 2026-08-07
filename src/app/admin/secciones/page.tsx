import { ShieldAlert } from "lucide-react";
import { getHomeSectionsRaw, getAllTitles, getFranchiseDefs } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";
import SectionsManager from "@/components/admin/SectionsManager";

export default async function AdminSeccionesPage() {
  const [sections, titles, user, franchiseOptions] = await Promise.all([
    getHomeSectionsRaw(),
    getAllTitles(),
    getCurrentUser(),
    getFranchiseDefs(),
  ]);
  const isFullAdmin = !user?.adminLevel || user.adminLevel === "full";

  if (!isFullAdmin) {
    return (
      <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-white/40" />
        <div>
          <p className="font-bold text-white">Acceso restringido</p>
          <p className="mt-1 text-sm text-white/50">
            Solo los administradores totales pueden organizar las secciones del inicio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Secciones del inicio</h1>
      <p className="mt-1 text-sm text-white/50">
        Organiza las filas de contenido que aparecen en la página principal.
      </p>
      <div className="mt-6">
        <SectionsManager
          sections={sections}
          allTitles={titles.map((t) => ({ slug: t.slug, title: t.title }))}
          franchiseOptions={franchiseOptions}
        />
      </div>
    </div>
  );
}
