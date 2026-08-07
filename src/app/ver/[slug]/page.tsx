import { notFound } from "next/navigation";
import {
  getTitleBySlug,
  getRelated,
  getSiteSettings,
  getContributorByName,
  isFavoriteTitle,
  getVoteCounts,
  getUserVote,
  getReactionCounts,
  getUserReaction,
  recordWatchHistory,
  getSeasonsForTitle,
  isFollowingContributor,
} from "@/lib/data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { filterForKids } from "@/lib/kidsMode";
import { getActiveAdsByPlacement } from "@/lib/ads-data";
import PlayerPageClient from "@/components/PlayerPageClient";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getTitleBySlug(slug);
  if (!item) notFound();

  const [related, settings, uploader, user, profile, voteCounts, reactionCounts, seasons] = await Promise.all([
    getRelated(item),
    getSiteSettings(),
    item.uploaderName ? getContributorByName(item.uploaderName) : Promise.resolve(undefined),
    getCurrentUser(),
    getActiveProfile(),
    getVoteCounts(item.id),
    getReactionCounts(item.id),
    item.type === "series" ? getSeasonsForTitle(item.id) : Promise.resolve([]),
  ]);
  if (profile?.isKids && filterForKids([item], true).length === 0) notFound();

  const profileId = profile?.id ?? null;
  const [favorited, userVote, userReaction, uploaderFollowed] = await Promise.all([
    isFavoriteTitle(user?.id, item.id, profileId),
    getUserVote(user?.id, item.id, profileId),
    getUserReaction(user?.id, item.id, profileId),
    uploader ? isFollowingContributor(user?.id, uploader.id) : Promise.resolve(false),
  ]);

  if (user) {
    await recordWatchHistory(user.id, item.id, profileId).catch(() => {});
  }

  const showAds = settings.adsEnabled && !user?.isPremium;
  const playerAds = showAds ? await getActiveAdsByPlacement("player") : [];

  return (
    <PlayerPageClient
      item={item}
      related={related}
      settings={settings}
      uploader={uploader}
      uploaderFollowed={uploaderFollowed}
      isLoggedIn={Boolean(user)}
      initialFavorited={favorited}
      initialVote={userVote}
      initialVoteCounts={voteCounts}
      initialReaction={userReaction}
      initialReactionCounts={reactionCounts}
      seasons={seasons}
      playerAd={playerAds[0]}
    />
  );
}
