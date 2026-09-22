import { ShieldAlert } from "lucide-react";
import { getTags } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";
import TagManager from "@/components/admin/TagManager";

export default async function AdminEtiquetasPage() {
  const [tags, user] = await Promise.all([getTags(), getCurrentUser()]);
  const isFullAdmin = !user?.adminLevel || user.adminLevel === "full";

  if (!isFullAdmin) {
    return (
      <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-white/40" />
        <div>
          <p className="font-bold text-white">Acceso restringido</p>
          <p className="mt-1 text-sm text-white/50">
            Solo los administradores totales pueden gestionar las etiquetas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Etiquetas</h1>
      <p className="mt-1 text-sm text-white/50">
        Crea y personaliza etiquetas (NUEVO, 4K, RECOMENDADO, etc.) para asignarlas a cualquier
        libro.
      </p>
      <div className="mt-6">
        <TagManager tags={tags} />
      </div>
    </div>
  );
}
