import { ShieldCheck } from "lucide-react";

const BASIS_LABEL: Record<string, string> = {
  owner: "Titular de los derechos de autor",
  public_domain: "Dominio público",
  authorized: "Autorización de terceros",
};

export default function BookRightsAuditPanel({
  declaration,
}: {
  declaration: {
    basis: string;
    userId: string;
    ipAddress: string | null;
    policyVersion: string;
    acceptedAt: Date;
  } | null;
}) {
  if (!declaration) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-500">
        Este libro no tiene declaración de derechos registrada.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
        <ShieldCheck size={16} className="text-accent" />
        Declaración de derechos (auditoría)
      </h3>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-white/40">Base legal</dt>
          <dd className="text-white/80">{BASIS_LABEL[declaration.basis] ?? declaration.basis}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/40">Fecha de aceptación</dt>
          <dd className="text-white/80">{new Date(declaration.acceptedAt).toLocaleString("es-ES")}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/40">Usuario</dt>
          <dd className="truncate text-white/80">{declaration.userId}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/40">IP registrada</dt>
          <dd className="text-white/80">{declaration.ipAddress ?? "No disponible"}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/40">Versión de política</dt>
          <dd className="text-white/80">{declaration.policyVersion}</dd>
        </div>
      </dl>
    </div>
  );
}
