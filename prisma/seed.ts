import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.notification.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.editSuggestion.deleteMany();
  await prisma.report.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.title.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.pendingSubmission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.homeSection.deleteMany();
  await prisma.siteSettings.deleteMany();

  const flowerVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const titles = [
    {
      slug: "the-odyssey",
      title: "The Odyssey",
      featured: true,
      featuredOrder: 1,
      uploaderName: "MovieHunter_MX",
      trivia: [
        "La escena de la tormenta se filmó en un tanque de agua gigante construido especialmente para la película.",
        "El vestuario de Odiseo pesaba más de 15 kilos con toda la armadura.",
      ],
      originalTitle: "The Odyssey",
      type: "movie",
      year: 2026,
      duration: "2h 53m",
      rating: 8.0,
      ageRating: "PG-13",
      country: "United States",
      language: "English",
      genres: ["Action", "Adventure", "Fantasy"],
      tags: ["Mythology", "Epic", "Gods", "Sea Voyage"],
      synopsis:
        "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
      badges: ["new", "trending"],
      director: "Christopher Nolan",
      cast: ["Matt Damon", "Tom Holland", "Anne Hathaway", "Charlize Theron", "Zendaya"],
      hasTrailer: true,
      galleryCount: 8,
      views: 154302,
      addedAt: "2026-07-10",
      relatedSlugs: [
        "the-lord-of-the-rings-fellowship",
        "the-lord-of-the-rings-two-towers",
        "narnia",
        "troy",
      ],
      sourceKind: "video",
      sourceValue: flowerVideo,
      playback: [
        {
          id: "es-latino",
          label: "Español Latino",
          flag: "MX",
          badge: "HD",
          servers: [
            { id: "hyper", name: "Servidor Hyper", quality: "1080p", source: { kind: "video", value: flowerVideo } },
            { id: "nebula", name: "Servidor Nebula", quality: "720p", source: { kind: "iframe", value: "" } },
          ],
        },
        {
          id: "es",
          label: "Castellano",
          flag: "ES",
          badge: "HD",
          servers: [
            { id: "hyper-es", name: "Servidor Hyper", quality: "1080p", source: { kind: "iframe", value: "" } },
          ],
        },
        {
          id: "en-sub",
          label: "Inglés Subtitulado",
          flag: "US",
          badge: "CC",
          servers: [
            { id: "orion", name: "Servidor Orion", quality: "4K", source: { kind: "video", value: flowerVideo } },
            { id: "vega", name: "Servidor Vega", quality: "1080p", source: { kind: "iframe", value: "" } },
          ],
        },
      ],
    },
    {
      slug: "disclosure-day",
      title: "Disclosure Day",
      type: "movie",
      year: 2025,
      duration: "1h 47m",
      rating: 7.2,
      ageRating: "R",
      country: "United Kingdom",
      genres: ["Thriller", "Mystery"],
      synopsis: "A government analyst uncovers a secret that could change everything the world believes.",
      badges: ["hd"],
      director: "Denis Villeneuve",
      cast: ["Oscar Isaac", "Rebecca Ferguson"],
      views: 42110,
      addedAt: "2026-06-02",
    },
    {
      slug: "supergirl",
      title: "Supergirl",
      type: "series",
      year: 2024,
      duration: "45m",
      rating: 7.8,
      ageRating: "PG",
      genres: ["Action", "Sci-Fi"],
      synopsis: "Kara Zor-El embraces her powers to protect National City from rising threats.",
      badges: ["top10"],
    },
    {
      slug: "spider-man",
      title: "Spider-Man",
      type: "movie",
      year: 2023,
      duration: "2h 10m",
      rating: 8.5,
      ageRating: "PG-13",
      genres: ["Action", "Adventure"],
      synopsis: "A young hero balances life and responsibility while facing a new threat to the city.",
      badges: ["4k", "trending"],
      featured: true,
      featuredOrder: 2,
    },
    {
      slug: "house-of-the-dragon",
      title: "House of the Dragon",
      type: "series",
      year: 2024,
      duration: "58m",
      rating: 8.9,
      ageRating: "R",
      featured: true,
      featuredOrder: 3,
      genres: ["Drama", "Fantasy"],
      synopsis: "The Targaryen dynasty faces civil war as claims to the Iron Throne collide.",
      badges: ["top10", "4k"],
    },
    {
      slug: "obsession",
      title: "Obsession",
      type: "series",
      year: 2025,
      duration: "42m",
      rating: 6.9,
      ageRating: "R",
      genres: ["Drama", "Thriller"],
      synopsis: "A forbidden affair spirals out of control with devastating consequences.",
      badges: ["new"],
    },
    {
      slug: "masters-of-the-universe",
      title: "Masters of the Universe",
      type: "movie",
      year: 2026,
      duration: "2h 05m",
      rating: 7.1,
      ageRating: "PG-13",
      genres: ["Action", "Fantasy"],
      synopsis: "He-Man must master the power of Grayskull to save Eternia from Skeletor.",
      badges: ["hd"],
    },
    {
      slug: "the-stuff",
      title: "The Stuff",
      type: "movie",
      year: 2025,
      duration: "1h 32m",
      rating: 6.4,
      ageRating: "R",
      genres: ["Comedy", "Horror"],
      synopsis: "A group of friends discover a strange substance with a mind of its own.",
    },
    {
      slug: "the-lord-of-the-rings-fellowship",
      title: "The Lord of the Rings: The Fellowship of the Ring",
      type: "movie",
      year: 2001,
      duration: "2h 58m",
      rating: 9.1,
      ageRating: "PG-13",
      genres: ["Adventure", "Fantasy"],
      synopsis:
        "A hobbit and his companions set out to destroy a powerful ring before it falls into the wrong hands.",
      badges: ["top10"],
      franchise: "El Señor de los Anillos",
    },
    {
      slug: "the-lord-of-the-rings-two-towers",
      title: "The Lord of the Rings: The Two Towers",
      type: "movie",
      year: 2002,
      duration: "2h 59m",
      rating: 9.0,
      ageRating: "PG-13",
      genres: ["Adventure", "Fantasy"],
      synopsis: "The fellowship is broken, but the quest to destroy the One Ring continues.",
      franchise: "El Señor de los Anillos",
    },
    {
      slug: "narnia",
      title: "The Chronicles of Narnia",
      type: "movie",
      year: 2005,
      duration: "2h 23m",
      rating: 7.5,
      ageRating: "PG",
      genres: ["Adventure", "Family", "Fantasy"],
      synopsis: "Four siblings discover a magical world hidden inside an old wardrobe.",
    },
    {
      slug: "troy",
      title: "Troy",
      type: "movie",
      year: 2004,
      duration: "2h 43m",
      rating: 7.3,
      ageRating: "R",
      genres: ["Action", "Drama"],
      synopsis: "Achilles leads the Greeks in a legendary siege against the city of Troy.",
    },
  ];

  for (const t of titles) {
    await prisma.title.create({
      data: {
        slug: t.slug,
        title: t.title,
        originalTitle: t.originalTitle,
        type: t.type,
        year: t.year,
        duration: t.duration,
        rating: t.rating,
        ageRating: t.ageRating,
        country: t.country,
        language: t.language,
        genres: JSON.stringify(t.genres ?? []),
        tags: JSON.stringify(t.tags ?? []),
        synopsis: t.synopsis,
        poster: t.slug,
        backdrop: t.slug,
        badges: JSON.stringify(t.badges ?? []),
        director: t.director,
        cast: JSON.stringify(t.cast ?? []),
        franchise: t.franchise ?? null,
        hasTrailer: t.hasTrailer ?? false,
        galleryCount: t.galleryCount,
        views: t.views ?? 0,
        addedAt: t.addedAt,
        relatedSlugs: JSON.stringify(t.relatedSlugs ?? []),
        sourceKind: t.sourceKind,
        sourceValue: t.sourceValue,
        playback: t.playback ? JSON.stringify(t.playback) : null,
        trivia: JSON.stringify(t.trivia ?? []),
        featured: t.featured ?? false,
        featuredOrder: t.featuredOrder ?? 0,
        uploaderName: t.uploaderName ?? null,
      },
    });
  }

  const contributors = [
    {
      name: "MovieHunter_MX",
      avatarSeed: "mh-mx",
      uploads: 342,
      joinedAt: "2025-02-14",
      badge: "gold",
      bio: "Coleccionista de clásicos y estrenos. Subo contenido casi todos los días.",
      country: "México",
      socialLink: "https://instagram.com/moviehunter_mx",
    },
    { name: "SerieAdicta", avatarSeed: "serie-adicta", uploads: 298, joinedAt: "2025-03-01", badge: "gold" },
    { name: "ElCuratorCine", avatarSeed: "curator-cine", uploads: 251, joinedAt: "2025-01-22", badge: "gold" },
    { name: "AnimeYSeries", avatarSeed: "anime-series", uploads: 187, joinedAt: "2025-04-10", badge: "silver" },
    { name: "RetroFilms88", avatarSeed: "retro-films", uploads: 164, joinedAt: "2025-02-28", badge: "silver" },
    { name: "LatinoStream", avatarSeed: "latino-stream", uploads: 139, joinedAt: "2025-05-16", badge: "silver" },
    { name: "NightOwlUploads", avatarSeed: "night-owl", uploads: 98, joinedAt: "2025-06-03", badge: "bronze" },
    { name: "CineClubBTK", avatarSeed: "cineclub", uploads: 76, joinedAt: "2025-06-20", badge: "bronze" },
    { name: "DramaKoreano", avatarSeed: "drama-koreano", uploads: 54, joinedAt: "2025-07-01", badge: "bronze" },
    { name: "Usuario_Nuevo7", avatarSeed: "usuario-nuevo7", uploads: 12, joinedAt: "2026-07-15", badge: null },
  ];

  for (const c of contributors) {
    await prisma.contributor.create({ data: c });
  }

  await prisma.pendingSubmission.createMany({
    data: [
      {
        title: "Estación Fantasma",
        type: "movie",
        playerLink: "https://embed.example.com/estacion-fantasma",
        description: "Un grupo de exploradores urbanos descubre algo que no debería despertarse.",
        submittedBy: "NightOwlUploads",
      },
      {
        title: "Reinos de Ceniza",
        type: "series",
        playerLink: "https://embed.example.com/reinos-de-ceniza-t1e1",
        submittedBy: "Anónimo",
      },
      {
        title: "El Último Verano",
        type: "movie",
        playerLink: "https://embed.example.com/ultimo-verano",
        description: "Drama independiente sobre una familia que pasa su última temporada en la costa.",
        submittedBy: "CineClubBTK",
      },
    ],
  });

  const adminPasswordHash = await bcrypt.hash("butakia2026", 10);
  await prisma.user.create({
    data: {
      email: "admin@butakia.com",
      passwordHash: adminPasswordHash,
      name: "Admin Butakia",
      role: "admin",
      adminLevel: "full",
      isPremium: true,
    },
  });

  const demoPasswordHash = await bcrypt.hash("demo1234", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@butakia.com",
      passwordHash: demoPasswordHash,
      name: "MovieHunter_MX",
      role: "user",
      isPremium: true,
    },
  });

  const movieHunter = await prisma.contributor.findFirst({
    where: { name: "MovieHunter_MX" },
  });
  if (movieHunter) {
    await prisma.contributor.update({
      where: { id: movieHunter.id },
      data: { userId: demoUser.id },
    });
  }

  await prisma.franchise.createMany({
    data: [
      "Star Wars",
      "Marvel Cinematic Universe",
      "DC",
      "El Señor de los Anillos",
      "Harry Potter",
      "Rápidos y Furiosos",
      "Jurassic Park",
      "John Wick",
      "Misión Imposible",
      "James Bond 007",
      "Transformers",
      "El Conjuro (Universo)",
      "Star Trek",
      "Piratas del Caribe",
      "X-Men",
      "Alien / Depredador",
    ].map((name) => ({ name })),
  });

  await prisma.homeSection.createMany({
    data: [
      { title: "Tendencias esta semana", type: "manual", order: 0, titleSlugs: "[]" },
      { title: "Novedades", type: "newest", order: 1 },
      { title: "Documentales", type: "genre", genre: "Documentary", order: 2 },
      { title: "Terror", type: "genre", genre: "Horror", order: 3 },
      { title: "Películas", type: "manual", order: 4, titleSlugs: "[]" },
      { title: "Series", type: "manual", order: 5, titleSlugs: "[]" },
      {
        title: "Porque viste The Odyssey",
        type: "similar",
        baseTitleSlug: "the-odyssey",
        order: 6,
      },
      {
        title: "El Señor de los Anillos",
        type: "franchise",
        franchise: "El Señor de los Anillos",
        order: 7,
      },
    ],
  });

  await prisma.siteSettings.create({
    data: {
      id: "singleton",
      siteName: "Butakia",
      paypalLink: "https://paypal.me/butakia",
      yapeNumber: "987 654 321",
      yapeQrUrl: "",
      totalDonations: 1250.5,
      donationSharePercent: 10,
      uploadGoal: 50,
      thankYouMessage:
        "¡Gracias por tu aporte! Gracias a colaboradores como tú, Butakia sigue creciendo. Sigue subiendo contenido para desbloquear más insignias y comisión.",
    },
  });

  console.log("Seed completado.");
  console.log("Admin: admin@butakia.com / butakia2026");
  console.log("Usuario demo: demo@butakia.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
