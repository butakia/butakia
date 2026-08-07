import { getReports } from "@/lib/data";
import ReportsList from "@/components/admin/ReportsList";

export default async function AdminReportesPage() {
  const reports = await getReports();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Reportes de enlaces caídos</h1>
      <p className="mt-1 text-sm text-white/50">
        Avisos de la comunidad sobre servidores o enlaces que no funcionan.
      </p>
      <div className="mt-6">
        <ReportsList reports={reports} />
      </div>
    </div>
  );
}
