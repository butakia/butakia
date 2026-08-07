import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28">
        <h1 className="mb-2 text-2xl font-black text-white">Crea tu cuenta</h1>
        <p className="mb-6 max-w-sm text-center text-sm text-white/50">
          Obtén insignia de colaborador, prioridad de revisión y beneficios Premium.
        </p>
        <RegisterForm />
      </main>
      <Footer />
    </>
  );
}
