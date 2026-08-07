import { getEditSuggestions } from "@/lib/data";
import EditSuggestionsList from "@/components/admin/EditSuggestionsList";

export default async function AdminEdicionesPage() {
  const suggestions = await getEditSuggestions();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Sugerencias de edición</h1>
      <p className="mt-1 text-sm text-white/50">
        Cambios propuestos por la comunidad, pendientes de tu aprobación.
      </p>
      <div className="mt-6">
        <EditSuggestionsList suggestions={suggestions} />
      </div>
    </div>
  );
}
