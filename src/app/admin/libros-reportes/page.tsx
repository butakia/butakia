import { getBookReports } from "@/lib/books-data";
import AdminBookReportsList from "@/components/admin/AdminBookReportsList";

export default async function AdminLibrosReportesPage() {
  const reports = await getBookReports();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Reportes de libros</h1>
      <p className="mt-1 text-sm text-white/50">
        Copyright, contenido ilegal, spam y otras denuncias de la comunidad sobre obras publicadas.
      </p>
      <div className="mt-6">
        <AdminBookReportsList reports={reports} />
      </div>
    </div>
  );
}
