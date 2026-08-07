import AdminTitleForm from "@/components/admin/AdminTitleForm";
import { getFranchiseDefs, getTags } from "@/lib/data";

export default async function NuevoTituloPage() {
  const [franchises, tags] = await Promise.all([getFranchiseDefs(), getTags()]);

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Agregar título</h1>
      <p className="mt-1 text-sm text-white/50">
        Solo el título, la portada y el enlace son necesarios para publicar; el resto lo puedes
        completar después.
      </p>
      <div className="mt-6">
        <AdminTitleForm franchises={franchises} tags={tags} />
      </div>
    </div>
  );
}
