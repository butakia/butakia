import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Tv, Compass, Pencil, ExternalLink, Trophy, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorBadge from "@/components/ContributorBadge";
import ContributorDonationCard from "@/components/ContributorDonationCard";
import AchievementsProgress from "@/components/AchievementsProgress";
import PlaylistManager from "@/components/PlaylistManager";
import SecurityQuestionsBanner from "@/components/SecurityQuestionsBanner";
import ReferralCard from "@/components/ReferralCard";
import BookRow from "@/components/BookRow";
import {
  getContributorByUserId,
  getTitlesByUploader,
  getSiteSettings,
  getTotalUploadsCount,
  getPendingSubmissionsByName,
  getPlaylistsByContributor,
  getAllTitles,
  hasSecurityQuestions,
} from "@/lib/data";
import { getContinueReadingBooks, attachReadingProgress } from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { getOrCreateReferralCode } from "@/lib/referral";
import { SITE_URL } from "@/lib/constants";

export default async function PanelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const contributor = await getContributorByUserId(user.id);
  if (!contributor) redirect("/");

  const [titles, settings, totalUploads, pendingSubmissions, playlists, allTitles, hasQuestions, referralCode, profile] =
    await Promise.all([
      getTitlesByUploader(contributor.name),
      getSiteSettings(),
      getTotalUploadsCount(),
      getPendingSubmissionsByName(contributor.name),
      getPlaylistsByContributor(contributor.id),
      getAllTitles(),
      hasSecurityQuestions(user.id),
      getOrCreateReferralCode(user.id),
      getActiveProfile(),
    ]);

  let continueReadingBooks = await getContinueReadingBooks(user.id, profile?.id ?? null);
  continueReadingBooks = await attachReadingProgress(continueReadingBooks, user.id, profile?.id ?? null);

  const movies = titles.filter((t) => t.type === "movie" && !t.genres.includes("Documentary"));
  const series = titles.filter((t) => t.type === "series");
  const documentaries = titles.filter((t) => t.genres.includes("Documentary"));

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

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-accent">{contributor.uploads}</p>
              <p className="text-xs text-white/50">aportes totales</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                <Film size={16} className="text-white/40" />
                {movies.length}
              </p>
              <p className="text-xs text-white/50">películas</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                <Tv size={16} className="text-white/40" />
                {series.length}
              </p>
              <p className="text-xs text-white/50">series</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                <Compass size={16} className="text-white/40" />
                {documentaries.length}
              </p>
              <p className="text-xs text-white/50">documentales</p>
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

          {pendingSubmissions.length > 0 && (
            <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
                <Clock size={17} className="text-yellow-500" />
                Pendiente de aprobación
              </h2>
              <div className="flex flex-col gap-2">
                {pendingSubmissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm"
                  >
                    <span className="truncate text-white/80">{p.title}</span>
                    <span className="shrink-0 rounded-full bg-yellow-500/15 px-2.5 py-1 text-[11px] font-bold uppercase text-yellow-500">
                      En revisión
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                Te avisaremos con una notificación en cuanto el equipo de Butakia revise tu aporte.
              </p>
            </div>
          )}

          <div className="mt-8">
            <PlaylistManager playlists={playlists} allTitles={allTitles} />
          </div>

          {titles.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-bold text-white">Mi contenido subido</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {titles.slice(0, 12).map((t) => (
                  <Link
                    key={t.id}
                    href={`/titulo/${t.slug}`}
                    className="truncate rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-1 font-bold text-white">¿Quieres subir más contenido?</h2>
            <p className="mb-3 text-sm text-white/60">
              Sube una nueva película o serie y suma un aporte más a tu perfil.
            </p>
            <Link
              href="/subir"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              Subir contenido
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
