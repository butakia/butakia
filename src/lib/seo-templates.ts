// Quick-fill SEO title patterns, matching the exact phrasing people actually type
// into Google when looking for free books — used by the book admin form.

export const SEO_TITLE_TEMPLATES_LIBROS = [
  { label: "Español Latino", build: (name: string) => `Leer ${name} Online Gratis en Español` },
  { label: "Sin anuncios", build: (name: string) => `Leer ${name} Gratis Sin Anuncios` },
  { label: "Descargar / PDF", build: (name: string) => `Descargar ${name} Gratis en Español` },
];
