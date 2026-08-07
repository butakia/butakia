import { HelpCircle, Upload, ShieldQuestion, HandCoins, MessageCircleQuestion } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description: "Preguntas frecuentes sobre Butakia: cómo subir contenido, revisión de aportes y más.",
};

const FAQS = [
  {
    icon: Upload,
    q: "¿Cómo subo una película o serie?",
    a: 'Ve a "Subir" en el menú superior, completa el formulario con el enlace del reproductor y la portada, confirma que el enlace se visualiza correctamente, y envíalo. Quedará pendiente de revisión antes de publicarse.',
  },
  {
    icon: ShieldQuestion,
    q: "¿Por qué mi aporte no aparece todavía?",
    a: "Todo contenido enviado por la comunidad pasa por una revisión del equipo de administración antes de publicarse en el catálogo. Puedes ver el estado de tus envíos y recibirás una notificación cuando se apruebe o se rechace.",
  },
  {
    icon: HandCoins,
    q: "¿Cómo funciona la comisión de colaboradores?",
    a: "Butakia comparte un porcentaje de las donaciones recibidas entre los colaboradores activos, en proporción a su número de aportes frente al total de la comunidad. Puedes ver el detalle y tu estimado en tu panel de colaborador.",
  },
  {
    icon: MessageCircleQuestion,
    q: "Encontré un enlace caído, ¿qué hago?",
    a: 'En la página de reproducción de cualquier título encontrarás el botón "Reportar servidor caído", donde puedes avisarnos con un comentario opcional para que lo revisemos.',
  },
];

export default function AyudaPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <HelpCircle size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Centro de ayuda</h1>
              <p className="text-sm text-white/50">Preguntas frecuentes sobre Butakia.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <f.icon size={17} className="text-accent" />
                  <h2 className="font-bold text-white">{f.q}</h2>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
