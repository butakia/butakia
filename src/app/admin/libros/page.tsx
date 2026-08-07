import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllBooksAdmin } from "@/lib/books-data";
import AdminBooksTable from "@/components/admin/AdminBooksTable";

export default async function AdminLibrosPage() {
  const books = await getAllBooksAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Libros</h1>
          <p className="mt-1 text-sm text-white/50">{books.length} libros en la biblioteca.</p>
        </div>
        <Link
          href="/admin/libros/nuevo"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          Agregar libro
        </Link>
      </div>

      <div className="mt-5">
        <AdminBooksTable books={books} />
      </div>
    </div>
  );
}
