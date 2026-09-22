import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookForm from "@/components/BookForm";
import { getCurrentUser } from "@/lib/dal";
import { getSiteSettings } from "@/lib/data";

export default async function PublicarLibroPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-black text-white">Publica tu obra</h1>
          <p className="mt-1 text-sm text-white/50">
            Sube un PDF, pega tu texto o escribe directamente en Butakia. Tu obra se publica de
            inmediato en la biblioteca.
          </p>
          <div className="mt-6">
            <BookForm mode="public" pdfUploadEnabled={settings.pdfUploadEnabled} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
