import Link from "next/link";
import { getBookBySlug, getRightsDeclaration } from "@/lib/books-data";
import { getTags, getSiteSettings } from "@/lib/data";
import BookForm from "@/components/BookForm";
import BookRightsAuditPanel from "@/components/admin/BookRightsAuditPanel";

export default async function EditarLibroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return (
      <div>
        <p className="text-white/60">No se encontró ese libro.</p>
        <Link href="/admin/libros" className="mt-2 inline-block text-accent hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const [declaration, tags, settings] = await Promise.all([
    getRightsDeclaration(book.id),
    getTags(),
    getSiteSettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Editar: {book.title}</h1>
      <div className="mt-6 max-w-3xl">
        <BookForm initial={book} tags={tags} pdfUploadEnabled={settings.pdfUploadEnabled} />
      </div>
      <div className="mt-8 max-w-3xl">
        <BookRightsAuditPanel declaration={declaration} />
      </div>
    </div>
  );
}
