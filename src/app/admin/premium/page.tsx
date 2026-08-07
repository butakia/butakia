import { Crown } from "lucide-react";
import { getPremiumRequests } from "@/lib/data";
import PremiumRequestRow from "@/components/admin/PremiumRequestRow";

export default async function AdminPremiumPage() {
  const requests = await getPremiumRequests();

  return (
    <div>
      <div className="flex items-center gap-2">
        <Crown size={22} className="text-yellow-400" />
        <h1 className="text-2xl font-black text-white">Solicitudes Premium</h1>
      </div>
      <p className="mt-1 text-sm text-white/50">
        {requests.length} solicitud{requests.length === 1 ? "" : "es"} pendiente
        {requests.length === 1 ? "" : "s"} de revisión.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        {requests.length === 0 ? (
          <p className="bg-white/[0.02] p-8 text-center text-sm text-white/40">
            No hay solicitudes pendientes.
          </p>
        ) : (
          requests.map((r) => <PremiumRequestRow key={r.id} request={r} />)
        )}
      </div>
    </div>
  );
}
