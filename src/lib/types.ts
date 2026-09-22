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

export interface SiteSettings {
  siteName: string;
  paypalLink?: string;
  yapeNumber?: string;
  yapeQrUrl?: string;
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
