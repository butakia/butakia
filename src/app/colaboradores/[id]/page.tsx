import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Calendar, Globe, Link2, Pencil, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorBadge from "@/components/ContributorBadge";
import ContributorDonationCard from "@/components/ContributorDonationCard";
import AchievementsProgress from "@/components/AchievementsProgress";
import FollowButton from "@/components/FollowButton";
import BookRow from "@/components/BookRow";
import {
  getContributorById,
  getSiteSettings,
  getTotalUploadsCount,
  isFollowingContributor,
} from "@/lib/data";
import { getBooksByContributor } from "@/lib/books-data";
import { getCurrentUser } from "@/lib/dal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const contributor = await getContributorById(id);
  if (!contributor) return {};

  return {
    title: `${contributor.name} — Colaborador`,
    description:
      contributor.bio ||
      `Perfil de ${contributor.name}, colaborador de Butakia con ${contributor.uploads} aportes.`,
    openGraph: {
      title: contributor.name,
      images: contributor.avatarUrl ? [contributor.avatarUrl] : undefined,
    },
  };
}

export default async function ContributorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contributor = await getContributorById(id);
  if (!contributor) notFound();

  const [settings, totalUploads, currentUser, books] = await Promise.all([
    getSiteSettings(),
    getTotalUploadsCount(),
    getCurrentUser(),
    getBooksByContributor(contributor.id),
  ]);

  const isOwner = currentUser?.id === contributor.userId;
  const following = currentUser ? await isFollowingContributor(currentUser.id, contributor.id) : false;

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            {contributor.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contributor.avatarUrl}
                alt={contributor.name}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ring-2 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, hsl(${(contributor.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(contributor.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
                }}
              >
                {contributor.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-black text-white">{contributor.name}</h1>
                {isOwner ? (
                  <Link
                    href={`/colaboradores/${contributor.id}/editar`}
                    aria-label="Editar perfil"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                  >
                    <Pencil size={13} />
                  </Link>
                ) : (
                  <FollowButton
                    contributorId={contributor.id}
                    initialFollowing={following}
                    isLoggedIn={Boolean(currentUser)}
                  />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <ContributorBadge tier={contributor.badge} isAdmin={contributor.isAdmin} />
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/60">
                  <Users size={12} />
                  {contributor.followersCount ?? 0} seguidores
                </span>
              </div>

              {contributor.bio && (
                <p className="mt-3 max-w-lg text-sm text-white/70">{contributor.bio}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 sm:justify-start">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> Miembro desde {contributor.joinedAt}
                </span>
                {contributor.country && (
                  <span className="flex items-center gap-1">
                    <Globe size={13} /> {contributor.country}
                  </span>
                )}
                {contributor.socialLink && (
                  <a
                    href={contributor.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <Link2 size={13} /> Red social
                  </a>
                )}
              </div>

              {isOwner && (
                <Link
                  href="/panel"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent/15 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
                >
                  Ir a mi panel de colaborador
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8">
            <AchievementsProgress uploads={contributor.uploads} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {settings.donationsEnabled && (
            <div className="mt-8">
              <ContributorDonationCard
                totalDonations={settings.totalDonations}
                donationSharePercent={settings.donationSharePercent}
                uploadGoal={settings.uploadGoal}
                uploads={contributor.uploads}
                totalUploads={totalUploads}
              />
            </div>
          )}

          {books.length > 0 && (
            <div className="mt-8 -mx-6 md:-mx-10">
              <BookRow title={`Libros de ${contributor.name}`} items={books} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
