import Link from "next/link";
import { Pencil, BookOpen } from "lucide-react";
import { getAllLiteraryAuthors } from "@/lib/books-data";

export default async function AdminLibrosAutoresPage() {
  const authors = await getAllLiteraryAuthors();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Autores literarios</h1>
      <p className="mt-1 text-sm text-white/50">
        Se crean automáticamente cuando alguien publica un libro con un autor nuevo (ej. obras de
        dominio público como Kafka). Aquí puedes agregarles foto y biografía.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        {authors.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] p-3 last:border-b-0 hover:bg-white/5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {a.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photoUrl} alt={a.name} className="h-full w-full object-cover" />
              ) : (
                <BookOpen size={16} className="text-white/40" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{a.name}</p>
              <p className="truncate text-xs text-white/40">{a.bio || "Sin biografía"}</p>
            </div>
            <Link
              href={`/admin/libros-autores/${a.id}/editar`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Pencil size={16} />
            </Link>
          </div>
        ))}
        {authors.length === 0 && <p className="p-6 text-center text-sm text-white/40">Aún no hay autores registrados.</p>}
      </div>
    </div>
  );
}
