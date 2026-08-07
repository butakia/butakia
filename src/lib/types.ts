export type ContentType = "movie" | "series";

export interface Title {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  type: ContentType;
  year: number;
  duration?: string;
  rating: number;
  ageRating?: string;
  country?: string;
  language?: string;
  genres: string[];
  tags?: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  badges?: Array<"new" | "trending" | "top10" | "4k" | "hd">;
  customTags?: string[];
  director?: string;
  cast?: string[];
  franchise?: string;
  hasTrailer?: boolean;
  trailerUrl?: string;
  galleryCount?: number;
  views?: number;
  addedAt?: string;
  relatedSlugs?: string[];
  source?: {
    kind: "video" | "iframe";
    value: string;
  };
  playback?: PlaybackLanguage[];
  featured?: boolean;
  featuredOrder?: number;
  seasons?: Season[];
  uploaderName?: string;
  trivia?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  progressPercent?: number;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authorName: string;
  authorId?: string;
  literaryAuthorId?: string;
  literaryAuthorSlug?: string;
  showUploader: boolean;
  publisher?: string;
  year?: number;
  language?: string;
  isbn?: string;
  synopsis: string;
  cover: string;
  genres: string[];
  tags?: string[];
  categories?: string[];
  badges?: string[];
  contentType: "pdf" | "text" | "richtext";
  sourceKind: "pdf_upload" | "pasted_text" | "editor";
  pdfUrl?: string;
  pageCount?: number;
  wordCount?: number;
  status: "draft" | "published" | "unpublished" | "rejected";
  isFree: boolean;
  featured?: boolean;
  featuredOrder?: number;
  views: number;
  readCount: number;
  rating: number;
  uploaderId: string;
  uploaderName?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  progressPercent?: number;
}

export interface LiteraryAuthor {
  id: string;
  slug: string;
  name: string;
  photoUrl?: string;
  bio?: string;
}

export interface BookHighlight {
  id: string;
  bookId: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text: string;
}

export interface BookChapter {
  id: string;
  bookId: string;
  order: number;
  title?: string;
  content: string;
  pageStart?: number;
  pageEnd?: number;
}

export interface Report {
  id: string;
  titleId: string;
  titleName: string;
  titleSlug: string;
  message?: string;
  status: "open" | "resolved";
  createdAt: string;
}

export interface EditSuggestion {
  id: string;
  titleId: string;
  titleName: string;
  titleSlug: string;
  changes: {
    synopsis?: string;
    director?: string;
    cast?: string[];
    genres?: string[];
    playerLink?: string;
    posterUrl?: string;
    backdropUrl?: string;
  };
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  source?: {
    kind: "video" | "iframe";
    value: string;
  };
}

export interface Season {
  id: string;
  number: number;
  name?: string;
  episodes: Episode[];
}

export interface PlaybackServer {
  id: string;
  name: string;
  quality?: string;
  source: {
    kind: "video" | "iframe";
    value: string;
  };
}

export interface PlaybackLanguage {
  id: string;
  label: string;
  flag: string;
  badge?: string;
  servers: PlaybackServer[];
}

export interface Row {
  id: string;
  title: string;
  subtitle?: string;
  items: Title[];
}

export interface Contributor {
  id: string;
  name: string;
  avatarSeed: string;
  avatarUrl?: string;
  uploads: number;
  joinedAt: string;
  badge?: "gold" | "silver" | "bronze";
  bio?: string;
  country?: string;
  socialLink?: string;
  isAdmin?: boolean;
  adminLevel?: "full" | "partial";
  userId?: string;
  followersCount?: number;
}

export interface PendingSubmission {
  id: string;
  title: string;
  type: ContentType;
  playerLink: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  director?: string;
  cast?: string[];
  year?: number;
  country?: string;
  language?: string;
  duration?: string;
  genres?: string[];
  franchise?: string;
  previewConfirmed?: boolean;
  playbackEntries?: { id: string; languageId: string; serverName: string; playerLink: string }[];
  submittedBy: string;
  submittedAt: string;
}

export interface HomeSection {
  id: string;
  title: string;
  type: "manual" | "genre" | "newest" | "similar" | "franchise";
  genre?: string;
  baseTitleSlug?: string;
  franchise?: string;
  titleSlugs: string[];
  order: number;
  active: boolean;
}

export interface Comment {
  id: string;
  titleId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  body: string;
  authorName: string;
  authorId?: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId?: string;
  section: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  replyCount: number;
  replies?: ForumReply[];
}

export interface Notification {
  id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface VoteCounts {
  likes: number;
  dislikes: number;
}

export type ReactionEmoji = "like" | "heart" | "cry" | "poop";

export type ReactionCounts = Record<ReactionEmoji, number>;

export interface SiteSettings {
  siteName: string;
  paypalLink?: string;
  yapeNumber?: string;
  yapeQrUrl?: string;
  allowGuestPlayback: boolean;
  requireApproval: boolean;
  totalDonations: number;
  donationSharePercent: number;
  uploadGoal: number;
  thankYouMessage: string;
  premiumPriceMonthly: number;
  premiumEnabled: boolean;
  profilesPremiumOnly: boolean;
  maxProfilesFree: number;
  accentColor: string;
  siteTagline: string;
  librosTagline: string;
  librosHeroMessage: string;
  adsEnabled: boolean;
  donationsEnabled: boolean;
  prerollEnabled: boolean;
  pdfUploadEnabled: boolean;
  fakeVisitorsEnabled: boolean;
  fakeVisitorsMin: number;
  fakeVisitorsMax: number;
  logoUrl?: string;
  faviconUrl?: string;
  siteDescription: string;
  secondaryColor: string;
  bannerUrl?: string;
  bannerLink?: string;
  bannerEnabled: boolean;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialWhatsapp?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatarSeed: string;
  avatarUrl?: string;
  hasPin: boolean;
  isKids: boolean;
  createdAt: string;
}

export interface PremiumRequest {
  id: string;
  userId: string;
  userName: string;
  method: "paypal" | "yape";
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface FranchiseDef {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
  order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: "noticia" | "actualizacion" | "articulo";
  authorName: string;
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Playlist {
  id: string;
  contributorId: string;
  name: string;
  description?: string;
  titleIds: string[];
  titles?: Title[];
  createdAt: string;
}
