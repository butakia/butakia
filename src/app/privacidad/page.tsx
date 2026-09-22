import { ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Butakia maneja tus datos.",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-2xl font-black text-white">Política de privacidad</h1>
          </div>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-white/60">
            <p>
              Butakia recopila únicamente los datos necesarios para operar la plataforma: tu correo
              y nombre de usuario al registrarte, y el contenido que subes o comentas de forma
              voluntaria.
            </p>
            <p>
              No vendemos ni compartimos tus datos personales con terceros. La información de tu
              cuenta se usa exclusivamente para identificarte, mostrar tu perfil de colaborador (si
              decides completarlo) y enviarte notificaciones relacionadas con tu actividad en el
              sitio.
            </p>
            <p>
              Los libros en Butakia son subidos y compartidos por la propia comunidad de
              colaboradores. No somos responsables de verificar por adelantado los derechos de
              autor de cada obra; para eso existe el sistema de reportes.
            </p>
            <p>
              Puedes solicitar la eliminación de tu cuenta y tus datos en cualquier momento
              escribiendo a soporte@butakia.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
