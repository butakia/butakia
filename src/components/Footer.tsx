import Logo from "./Logo";
import FooterLinks from "./FooterLinks";
import { getSiteSettings } from "@/lib/data";

export default async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="mt-16 border-t border-border px-6 py-10 text-sm text-muted md:px-10">
      <Logo className="mb-4" />
      {settings.siteTagline && <p className="mb-4 max-w-md text-xs text-muted/80">{settings.siteTagline}</p>}
      <FooterLinks />
    </footer>
  );
}
