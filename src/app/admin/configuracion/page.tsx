import { ShieldAlert } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

export default async function AdminConfiguracionPage() {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);
  const isFullAdmin = !user?.adminLevel || user.adminLevel === "full";

  if (!isFullAdmin) {
    return (
      <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-white/40" />
        <div>
          <p className="font-bold text-white">Acceso restringido</p>
          <p className="mt-1 text-sm text-white/50">
            Solo los administradores totales pueden modificar la configuración del sitio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white">Configuración</h1>
      <p className="mt-1 text-sm text-white/50">Ajustes generales del sitio.</p>
      <div className="mt-6">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
