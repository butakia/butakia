import { Mail, MessageSquare, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo de Butakia.",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();
  const email = settings.contactEmail || "soporte@butakia.com";

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Mail size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Contacto</h1>
              <p className="text-sm text-white/50">¿Tienes una duda, sugerencia o problema? Escríbenos.</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold text-white">Correo de soporte</p>
                <a href={`mailto:${email}`} className="mt-1 block text-sm text-white/60 hover:text-accent">
                  {email}
                </a>
              </div>
            </div>
            {settings.contactPhone && (
              <div className="mt-4 flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold text-white">Teléfono</p>
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                    className="mt-1 block text-sm text-white/60 hover:text-accent"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </div>
            )}
            <p className="mt-5 text-sm text-white/50">
              Para reportar un libro específico, usa el botón{" "}
              <span className="text-white/80">&ldquo;Reportar&rdquo;</span> directamente en la
              página del libro — así el equipo puede ubicarlo más rápido.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
