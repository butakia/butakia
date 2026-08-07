import { FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Términos y condiciones de uso de Butakia.",
};

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <FileText size={20} />
            </span>
            <h1 className="text-2xl font-black text-white">Términos de uso</h1>
          </div>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-white/60">
            <p>
              Butakia es una plataforma colaborativa: no aloja archivos de video propios, solo
              indexa enlaces de reproductores externos que la comunidad comparte voluntariamente.
            </p>
            <p>
              Al subir contenido, declaras que el enlace compartido es de acceso público o que
              cuentas con los derechos necesarios para compartirlo. Butakia se reserva el derecho de
              revisar, rechazar o retirar cualquier aporte que incumpla estas normas o las políticas
              de la comunidad.
            </p>
            <p>
              El uso de insignias, comisiones estimadas por donaciones y roles de administrador
              parcial/total son mecanismos internos de reconocimiento a la comunidad y no
              constituyen una relación laboral ni un pago garantizado.
            </p>
            <p>
              Nos reservamos el derecho de suspender cuentas que abusen del sistema de subida,
              comentarios o votos, o que intenten vulnerar la seguridad del sitio.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
