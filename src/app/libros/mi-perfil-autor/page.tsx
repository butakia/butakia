import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import LibrosHeader from "@/components/LibrosHeader";
import Footer from "@/components/Footer";
import AuthorProfileManager from "@/components/AuthorProfileManager";
import { getLiteraryAuthorByUserId, getAllBooksByLiteraryAuthorForOwner } from "@/lib/books-data";
import { getCurrentUser } from "@/lib/dal";

export const metadata = {
  title: "Mi perfil de autor",
};

export default async function MiPerfilAutorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const author = await getLiteraryAuthorByUserId(user.id);
  const books = author ? await getAllBooksByLiteraryAuthorForOwner(author.id) : [];

  return (
    <>
      <LibrosHeader />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <PenLine size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Mi perfil de autor</h1>
              <p className="text-sm text-white/50">
                Gestiona tu perfil público de autor verificado en Butakia Libros.
              </p>
            </div>
          </div>

          <AuthorProfileManager
            profile={
              author
                ? {
                    id: author.id,
                    slug: author.slug,
                    name: author.name,
                    photoUrl: author.photoUrl,
                    bio: author.bio,
                    trajectory: author.trajectory,
                    verified: author.verified,
                  }
                : null
            }
            books={books}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
