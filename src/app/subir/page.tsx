import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadForm from "@/components/UploadForm";
import MonetizationBanner from "@/components/MonetizationBanner";
import UploadGate from "@/components/UploadGate";
import { getFranchiseDefs } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export default async function SubirPage() {
  const [franchises, user] = await Promise.all([getFranchiseDefs(), getCurrentUser()]);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <UploadGate>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Sube tu contenido a Butakia
            </h1>
            <p className="mt-3 text-white/60">
              Butakia crece gracias a su comunidad. Comparte películas y series con un enlace de
              reproductor — sin necesidad de crear una cuenta.
            </p>
          </div>
          <MonetizationBanner />
          <UploadForm franchises={franchises} isLoggedIn={Boolean(user)} />
        </UploadGate>
      </main>
      <Footer />
    </>
  );
}
