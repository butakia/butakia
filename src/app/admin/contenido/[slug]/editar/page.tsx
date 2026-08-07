import Link from "next/link";
import { getTitleBySlug, getSeasonsForTitle, getFranchiseDefs, getTags } from "@/lib/data";
import AdminTitleForm from "@/components/admin/AdminTitleForm";
import SeasonsManager from "@/components/admin/SeasonsManager";

export default async function EditarTituloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getTitleBySlug(slug);

  if (!item) {
    return (
      <div>
        <p className="text-white/60">No se encontró ese título.</p>
        <Link href="/admin/contenido" className="mt-2 inline-block text-accent hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const [seasons, franchises, tags] = await Promise.all([
    item.type === "series" ? getSeasonsForTitle(item.id) : Promise.resolve([]),
    getFranchiseDefs(),
    getTags(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Editar: {item.title}</h1>
      <div className="mt-6 max-w-3xl">
        <AdminTitleForm initial={item} franchises={franchises} tags={tags} />
      </div>

      {item.type === "series" && (
        <div className="mt-8 max-w-3xl">
          <SeasonsManager titleId={item.id} seasons={seasons} />
        </div>
      )}
    </div>
  );
}
