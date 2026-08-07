import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecoverPasswordForm from "@/components/RecoverPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28">
        <h1 className="mb-2 text-2xl font-black text-white">Recuperar contraseña</h1>
        <p className="mb-6 max-w-sm text-center text-sm text-white/50">
          Responde tus preguntas de seguridad para elegir una nueva contraseña.
        </p>
        <RecoverPasswordForm />
      </main>
      <Footer />
    </>
  );
}
