import type { Locale } from "./config";

// Flat key -> string per locale. Scoped for now to the site chrome (nav, footer,
// legal links) and the home hero fallbacks — the highest-traffic surfaces.
// Everything not listed here (admin panel, forms, detail pages) still renders in
// Spanish; add keys incrementally as each area gets translated.
export const dictionaries = {
  es: {
    "nav.home": "Inicio",
    "nav.books": "Libros",
    "nav.contributors": "Colaboradores",
    "nav.forum": "Foro",
    "nav.blog": "Blog",
    "nav.help": "Ayuda",
    "nav.login": "Iniciar sesión",
    "nav.visitorsNow": "visitantes actuales",
    "footer.books": "Libros",
    "footer.premium": "Premium",
    "footer.contact": "Contacto",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos de uso",
    "footer.help": "Ayuda",
    "footer.credits": "Créditos",
    "footer.rights": "Todos los libros y contenidos son solo de demostración.",
    "footer.language": "Idioma",
  },
  en: {
    "nav.home": "Home",
    "nav.books": "Books",
    "nav.contributors": "Contributors",
    "nav.forum": "Forum",
    "nav.blog": "Blog",
    "nav.help": "Help",
    "nav.login": "Log in",
    "nav.visitorsNow": "watching right now",
    "footer.books": "Books",
    "footer.premium": "Premium",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms of use",
    "footer.help": "Help",
    "footer.credits": "Credits",
    "footer.rights": "All books and content are for demonstration purposes only.",
    "footer.language": "Language",
  },
} satisfies Record<Locale, Record<string, string>>;

export type DictionaryKey = keyof (typeof dictionaries)["es"];
