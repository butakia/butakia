export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

// Curated list: Latin America first, then US/Spain and other relevant countries.
// Deliberately excludes most Asian/African countries per product decision.
export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
];
