import { ShieldAlert } from "lucide-react";
import { getFranchiseDefs } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";
import FranchiseManager from "@/components/admin/FranchiseManager";

export default async function AdminFranquiciasPage() {
  const [franchises, user] = await Promise.all([getFranchiseDefs(), getCurrentUser()]);
  const isFullAdmin = !user?.adminLevel || user.adminLevel === "full";

  if (!isFullAdmin) {
    return (
      <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-white/40" />
        <div>
          <p className="font-bold text-white">Acceso restringido</p>
          <p className="mt-1 text-sm text-white/50">
            Solo los administradores totales pueden gestionar las franquicias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Franquicias</h1>
      <p className="mt-1 text-sm text-white/50">
        Crea franquicias y sube su logotipo — se usan en el selector de subida y en la página
        pública de franquicias.
      </p>
      <div className="mt-6">
        <FranchiseManager franchises={franchises} />
      </div>
    </div>
  );
}
