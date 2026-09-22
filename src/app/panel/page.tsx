import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Pencil, ExternalLink, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorBadge from "@/components/ContributorBadge";
import ContributorDonationCard from "@/components/ContributorDonationCard";
import AchievementsProgress from "@/components/AchievementsProgress";
import SecurityQuestionsBanner from "@/components/SecurityQuestionsBanner";
import ReferralCard from "@/components/ReferralCard";
import BookRow from "@/components/BookRow";
import {
  getContributorByUserId,
  getSiteSettings,
  getTotalUploadsCount,
  hasSecurityQuestions,
} from "@/lib/data";
import { getContinueReadingBooks, attachReadingProgress, getBooksByContributor } from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { getOrCreateReferralCode } from "@/lib/referral";
import { SITE_URL } from "@/lib/constants";

export default async function PanelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const contributor = await getContributorByUserId(user.id);
  if (!contributor) redirect("/");

  const [settings, totalUploads, books, hasQuestions, referralCode, profile] =
    await Promise.all([
      getSiteSettings(),
      getTotalUploadsCount(),
      getBooksByContributor(contributor.id),
      hasSecurityQuestions(user.id),
      getOrCreateReferralCode(user.id),
      getActiveProfile(),
    ]);

  let continueReadingBooks = await getContinueReadingBooks(user.id, profile?.id ?? null);
  continueReadingBooks = await attachReadingProgress(continueReadingBooks, user.id, profile?.id ?? null);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-5xl">
          {!hasQuestions && <SecurityQuestionsBanner />}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 via-transparent to-transparent p-6">
            <div className="flex items-center gap-4">
              {contributor.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-accent/40"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ring-2 ring-accent/40"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(contributor.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(contributor.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
                  }}
                >
                  {contributor.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Bienvenido de vuelta</p>
                <h1 className="text-xl font-black text-white">{contributor.name}</h1>
                <div className="mt-1">
                  <ContributorBadge tier={contributor.badge} isAdmin={contributor.isAdmin} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/colaboradores/${contributor.id}`}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
              >
                <ExternalLink size={15} />
                Ver mi perfil público
              </Link>
              <Link
                href={`/colaboradores/${contributor.id}/editar`}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Pencil size={15} />
                Editar mi perfil
              </Link>
            </div>
          </div>

          {continueReadingBooks.length > 0 && (
            <div className="mt-6 [&>section]:px-0">
              <BookRow
                title="Continuar leyendo"
                subtitle="Progreso estimado según tu última sesión de lectura."
                items={continueReadingBooks}
              />
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-accent">{contributor.uploads}</p>
              <p className="text-xs text-white/50">aportes totales</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                <BookOpen size={16} className="text-white/40" />
                {books.length}
              </p>
              <p className="text-xs text-white/50">libros</p>
            </div>
          </div>

          <div className={`mt-6 grid gap-6 ${settings.donationsEnabled ? "lg:grid-cols-2" : ""}`}>
            <AchievementsProgress uploads={contributor.uploads} />
            {settings.donationsEnabled && (
              <ContributorDonationCard
                totalDonations={settings.totalDonations}
                donationSharePercent={settings.donationSharePercent}
                uploadGoal={settings.uploadGoal}
                uploads={contributor.uploads}
                totalUploads={totalUploads}
              />
            )}
          </div>

          <div className="mt-6">
            <ReferralCard referralLink={`${SITE_URL}/registro?ref=${referralCode}`} />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
            <Trophy size={22} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="font-bold text-white">Sigue subiendo para ganar más</p>
              <p className="mt-1 text-sm text-white/70">
                Cada aporte aumenta tu comisión estimada y te acerca a una insignia superior. Los
                colaboradores más activos y confiables pueden convertirse en administradores, con
                la posibilidad de personalizar el home y ganar créditos especiales en el sitio.
              </p>
            </div>
          </div>

          {books.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-bold text-white">Mis libros subidos</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {books.slice(0, 12).map((b) => (
                  <Link
                    key={b.id}
                    href={`/${b.slug}`}
                    className="truncate rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                  >
                    {b.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-1 font-bold text-white">¿Quieres subir más libros?</h2>
            <p className="mb-3 text-sm text-white/60">
              Publica un nuevo libro y suma un aporte más a tu perfil.
            </p>
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              Publicar libro
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
