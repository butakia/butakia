// Quick-fill SEO title patterns, matching the exact phrasing people actually type
// into Google when looking for free streams — used by both the movie/series admin
// form and the book admin form so both content types stay consistent.

export const SEO_TITLE_TEMPLATES = [
  { label: "Español Latino", build: (name: string) => `Ver ${name} Online Gratis Español Latino` },
  { label: "Sin anuncios", build: (name: string) => `Ver ${name} Online Gratis Sin Anuncios` },
  { label: "Gratis en Español", build: (name: string) => `Ver ${name} Gratis en Español` },
];

export const SEO_TITLE_TEMPLATES_LIBROS = [
  { label: "Español Latino", build: (name: string) => `Leer ${name} Online Gratis en Español` },
  { label: "Sin anuncios", build: (name: string) => `Leer ${name} Gratis Sin Anuncios` },
  { label: "Descargar / PDF", build: (name: string) => `Descargar ${name} Gratis en Español` },
];
