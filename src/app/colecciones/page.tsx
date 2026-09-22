import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCollectionManager from "@/components/BookCollectionManager";
import { getBookCollections, getFavoriteBooks } from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";

export default async function ColeccionesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getActiveProfile();
  const [collections, favoriteBooks] = await Promise.all([
    getBookCollections(user.id),
    getFavoriteBooks(user.id, profile?.id ?? null),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-black text-white">Mis colecciones</h1>
          <p className="mt-1 text-sm text-white/50">
            Organiza tus libros favoritos en colecciones temáticas.
          </p>
          <div className="mt-6">
            <BookCollectionManager collections={collections} favoriteBooks={favoriteBooks} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
