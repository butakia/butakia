import type { Metadata } from "next";
import { Crown, Sparkles, Zap, ShieldCheck, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PremiumRequestForm from "@/components/PremiumRequestForm";
import { getSiteSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Butakia Premium",
  description:
    "Hazte Premium en Butakia: navega sin anuncios, con acceso anticipado y prioridad de aprobación para tus aportes.",
};

const PERKS = [
  { icon: Sparkles, title: "Sin anuncios", desc: "Navega por todo el catálogo sin espacios publicitarios." },
  { icon: Zap, title: "Acceso anticipado", desc: "Mira los estrenos subidos por la comunidad antes que nadie." },
  { icon: ShieldCheck, title: "Insignia Premium", desc: "Una corona junto a tu nombre en comentarios, foro y perfil." },
  { icon: Clock, title: "Prioridad de revisión", desc: "Tus aportes se revisan primero cuando subes contenido." },
];

export default async function PremiumPage() {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  if (!settings.premiumEnabled) {
    return (
      <>
        <Header />
        <main className="flex-1 px-6 py-24 text-center text-white/50">
          Butakia Premium no está disponible por el momento.
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-400">
            <Crown size={26} />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Butakia Premium
          </h1>
          <p className="mt-3 text-white/60">
            Apoya el proyecto y llévate una mejor experiencia: sin anuncios, acceso anticipado y
            más. Desde ${settings.premiumPriceMonthly.toFixed(2)} al mes.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <p.icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-0.5 text-sm text-white/50">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <PremiumRequestForm
            isLoggedIn={Boolean(user)}
            isPremium={Boolean(user?.isPremium)}
            paypalLink={settings.paypalLink}
            yapeNumber={settings.yapeNumber}
            priceMonthly={settings.premiumPriceMonthly}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
