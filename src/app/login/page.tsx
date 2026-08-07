import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28">
        <h1 className="mb-6 text-2xl font-black text-white">Iniciar sesión</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
