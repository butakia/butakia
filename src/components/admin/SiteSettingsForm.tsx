"use client";

import { useState, useTransition } from "react";
import {
  Save,
  HandCoins,
  Heart,
  Crown,
  Users,
  Palette,
  BookOpen,
  Megaphone,
  Users2,
  Image as ImageIcon,
  Share2,
  Phone,
  LayoutTemplate,
} from "lucide-react";
import { updateSiteSettingsAction } from "@/lib/actions";
import { SiteSettings } from "@/lib/types";
import ImageDropzone from "@/components/ImageDropzone";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [paypalLink, setPaypalLink] = useState(settings.paypalLink ?? "");
  const [yapeNumber, setYapeNumber] = useState(settings.yapeNumber ?? "");
  const [yapeQrUrl, setYapeQrUrl] = useState(settings.yapeQrUrl ?? "");
  const [requireApproval, setRequireApproval] = useState(settings.requireApproval);
  const [totalDonations, setTotalDonations] = useState(String(settings.totalDonations));
  const [donationSharePercent, setDonationSharePercent] = useState(
    String(settings.donationSharePercent)
  );
  const [uploadGoal, setUploadGoal] = useState(String(settings.uploadGoal));
  const [thankYouMessage, setThankYouMessage] = useState(settings.thankYouMessage);
  const [premiumPriceMonthly, setPremiumPriceMonthly] = useState(String(settings.premiumPriceMonthly));
  const [premiumEnabled, setPremiumEnabled] = useState(settings.premiumEnabled);
  const [profilesPremiumOnly, setProfilesPremiumOnly] = useState(settings.profilesPremiumOnly);
  const [maxProfilesFree, setMaxProfilesFree] = useState(String(settings.maxProfilesFree));
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [siteTagline, setSiteTagline] = useState(settings.siteTagline);
  const [librosTagline, setLibrosTagline] = useState(settings.librosTagline);
  const [librosHeroMessage, setLibrosHeroMessage] = useState(settings.librosHeroMessage);
  const [adsEnabled, setAdsEnabled] = useState(settings.adsEnabled);
  const [donationsEnabled, setDonationsEnabled] = useState(settings.donationsEnabled);
  const [pdfUploadEnabled, setPdfUploadEnabled] = useState(settings.pdfUploadEnabled);
  const [fakeVisitorsEnabled, setFakeVisitorsEnabled] = useState(settings.fakeVisitorsEnabled);
  const [fakeVisitorsMin, setFakeVisitorsMin] = useState(String(settings.fakeVisitorsMin));
  const [fakeVisitorsMax, setFakeVisitorsMax] = useState(String(settings.fakeVisitorsMax));
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl ?? null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(settings.faviconUrl ?? null);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [bannerUrl, setBannerUrl] = useState<string | null>(settings.bannerUrl ?? null);
  const [bannerLink, setBannerLink] = useState(settings.bannerLink ?? "");
  const [bannerEnabled, setBannerEnabled] = useState(settings.bannerEnabled);
  const [socialFacebook, setSocialFacebook] = useState(settings.socialFacebook ?? "");
  const [socialInstagram, setSocialInstagram] = useState(settings.socialInstagram ?? "");
  const [socialTwitter, setSocialTwitter] = useState(settings.socialTwitter ?? "");
  const [socialYoutube, setSocialYoutube] = useState(settings.socialYoutube ?? "");
  const [socialTiktok, setSocialTiktok] = useState(settings.socialTiktok ?? "");
  const [socialWhatsapp, setSocialWhatsapp] = useState(settings.socialWhatsapp ?? "");
  const [footerText, setFooterText] = useState(settings.footerText ?? "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  // Guards against submitting before an image finishes uploading — saving mid-upload
  // used to persist before the real URL came back, silently dropping the image.
  const [uploadingCount, setUploadingCount] = useState(0);
  const handleUploadingChange = (uploading: boolean) => setUploadingCount((c) => c + (uploading ? 1 : -1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateSiteSettingsAction({
        siteName,
        paypalLink,
        yapeNumber,
        yapeQrUrl,
        requireApproval,
        totalDonations: Number(totalDonations) || 0,
        donationSharePercent: Number(donationSharePercent) || 0,
        uploadGoal: Number(uploadGoal) || 50,
        thankYouMessage,
        premiumPriceMonthly: Number(premiumPriceMonthly) || 4.99,
        premiumEnabled,
        profilesPremiumOnly,
        maxProfilesFree: Number(maxProfilesFree) || 4,
        accentColor,
        siteTagline,
        librosTagline,
        librosHeroMessage,
        adsEnabled,
        donationsEnabled,
        pdfUploadEnabled,
        fakeVisitorsEnabled,
        fakeVisitorsMin: Number(fakeVisitorsMin) || 20,
        fakeVisitorsMax: Number(fakeVisitorsMax) || 50,
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        siteDescription,
        secondaryColor,
        bannerUrl: bannerUrl || undefined,
        bannerLink: bannerLink || undefined,
        bannerEnabled,
        socialFacebook: socialFacebook || undefined,
        socialInstagram: socialInstagram || undefined,
        socialTwitter: socialTwitter || undefined,
        socialYoutube: socialYoutube || undefined,
        socialTiktok: socialTiktok || undefined,
        socialWhatsapp: socialWhatsapp || undefined,
        footerText: footerText || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Nombre del sitio</label>
        <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputCls} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <ImageIcon size={16} className="text-accent" />
          Identidad del sitio
        </h3>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="mb-1.5 text-xs text-white/50">Logo principal</p>
            <ImageDropzone
              label=""
              aspect="aspect-square"
              initialUrl={logoUrl ?? undefined}
              onChange={setLogoUrl}
              onUploadingChange={handleUploadingChange}
            />
            <p className="mt-1 max-w-[7rem] text-[10px] text-white/30">
              Si lo dejas vacío se usa el logo por defecto de Butakia.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-white/50">Favicon</p>
            <ImageDropzone
              label=""
              aspect="aspect-square"
              initialUrl={faviconUrl ?? undefined}
              onChange={setFaviconUrl}
              onUploadingChange={handleUploadingChange}
            />
            <p className="mt-1 max-w-[7rem] text-[10px] text-white/30">
              Ícono de la pestaña del navegador.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">
            Descripción del sitio (para buscadores como Google)
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <LayoutTemplate size={16} className="text-accent" />
          Banner promocional
        </h3>
        <label className="mb-3 flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
          <span className="text-xs text-white/70">Mostrar banner en el inicio</span>
          <input
            type="checkbox"
            checked={bannerEnabled}
            onChange={(e) => setBannerEnabled(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        <div className="flex flex-wrap items-start gap-4">
          <div>
            <p className="mb-1.5 text-xs text-white/50">Imagen del banner</p>
            <ImageDropzone
              label=""
              aspect="aspect-video"
              initialUrl={bannerUrl ?? undefined}
              onChange={setBannerUrl}
              onUploadingChange={handleUploadingChange}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs text-white/50">Enlace al hacer clic (opcional)</label>
            <input
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
              placeholder="https://... o /libros"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Palette size={16} className="text-accent" />
          Personalización visual
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Color de acento</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-white/15 bg-white/5"
              />
              <input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Color secundario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-white/15 bg-white/5"
              />
              <input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Frase debajo del logo (pie de página)</label>
            <input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} className={inputCls} />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          El color de acento se aplica en todo el sitio, incluyendo Butakia Libros. El color
          secundario se usa en degradados y detalles junto al de acento.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <BookOpen size={16} className="text-accent" />
          Personalización de Butakia Libros
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Subtítulo junto al logo</label>
            <input value={librosTagline} onChange={(e) => setLibrosTagline(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Mensaje destacado en el inicio</label>
            <input
              value={librosHeroMessage}
              onChange={(e) => setLibrosHeroMessage(e.target.value)}
              placeholder="Ej: Este mes destacamos autores independientes"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-sm text-white/80">
          Requerir aprobación antes de publicar aportes de usuarios
        </span>
        <input
          type="checkbox"
          checked={requireApproval}
          onChange={(e) => setRequireApproval(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
      </label>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <HandCoins size={16} className="text-accent" />
          Transparencia y comisión de colaboradores
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Total recaudado ($)</label>
            <input
              value={totalDonations}
              onChange={(e) => setTotalDonations(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">% para colaboradores</label>
            <input
              value={donationSharePercent}
              onChange={(e) => setDonationSharePercent(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Meta de aportes</label>
            <input
              value={uploadGoal}
              onChange={(e) => setUploadGoal(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Cada colaborador verá este total y su estimado proporcional a sus aportes en su perfil.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Crown size={16} className="text-yellow-400" />
          Butakia Premium
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Precio mensual ($)</label>
            <input
              value={premiumPriceMonthly}
              onChange={(e) => setPremiumPriceMonthly(e.target.value)}
              className={inputCls}
            />
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
            <span className="text-xs text-white/70">Premium activo</span>
            <input
              type="checkbox"
              checked={premiumEnabled}
              onChange={(e) => setPremiumEnabled(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Las solicitudes de pago se revisan en Admin → Premium. Usa los mismos métodos de pago de
          PayPal/Yape configurados abajo.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Megaphone size={16} className="text-accent" />
          Anuncios y monetización
        </h3>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
          <span className="text-xs text-white/70">Mostrar anuncios a usuarios sin Premium</span>
          <input
            type="checkbox"
            checked={adsEnabled}
            onChange={(e) => setAdsEnabled(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        <p className="mt-2 text-[11px] text-white/40">
          Controla si se muestran anuncios (popup, iframes, etc.) de forma independiente a si
          Butakia Premium está activo. Configura los anuncios en sí, sus tipos de iframe y dónde
          aparecen en Admin → Anuncios.
        </p>
        <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
          <span className="text-xs text-white/70">Permitir subir libros en PDF</span>
          <input
            type="checkbox"
            checked={pdfUploadEnabled}
            onChange={(e) => setPdfUploadEnabled(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        <p className="mt-2 text-[11px] text-white/40">
          Si está desactivado, se oculta la opción de subir un archivo PDF al publicar un libro
          (solo queda texto pegado o el editor enriquecido).
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Users2 size={16} className="text-accent" />
          Visitantes simulados en línea
        </h3>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
          <span className="text-xs text-white/70">Mostrar un número simulado de usuarios en línea</span>
          <input
            type="checkbox"
            checked={fakeVisitorsEnabled}
            onChange={(e) => setFakeVisitorsEnabled(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Mínimo</label>
            <input
              value={fakeVisitorsMin}
              onChange={(e) => setFakeVisitorsMin(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Máximo</label>
            <input
              value={fakeVisitorsMax}
              onChange={(e) => setFakeVisitorsMax(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          El sitio mostrará un número aleatorio dentro de este rango que cambia cada pocos segundos.
          Es temporal/estratégico — el contador de visitas real (no simulado) está más abajo en el
          panel de estadísticas del admin.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Users size={16} className="text-accent" />
          Perfiles por cuenta
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Perfiles gratis por cuenta</label>
            <input
              value={maxProfilesFree}
              onChange={(e) => setMaxProfilesFree(e.target.value)}
              className={inputCls}
            />
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
            <span className="text-xs text-white/70">Solo Premium puede crear varios</span>
            <input
              type="checkbox"
              checked={profilesPremiumOnly}
              onChange={(e) => setProfilesPremiumOnly(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Si activas esta opción, los usuarios sin Premium solo podrán tener un perfil (el
          principal); necesitarán Premium para agregar perfiles adicionales.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Heart size={16} className="text-accent" />
          Mensaje de agradecimiento
        </h3>
        <textarea
          value={thankYouMessage}
          onChange={(e) => setThankYouMessage(e.target.value)}
          rows={3}
          placeholder="Se envía como notificación cuando apruebas un aporte de un colaborador."
          className={`${inputCls} resize-none`}
        />
        <p className="mt-2 text-[11px] text-white/40">
          Este mensaje se agrega automáticamente a la notificación que recibe el colaborador cuando
          apruebas su aporte.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/70">Donaciones (debajo del reproductor)</h3>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
            {donationsEnabled ? "Activado" : "Desactivado"}
            <input
              type="checkbox"
              checked={donationsEnabled}
              onChange={(e) => setDonationsEnabled(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
          </label>
        </div>
        <p className="mb-3 text-[11px] text-white/40">
          Si está desactivado, se oculta todo lo relacionado a donaciones en el sitio (botones,
          barra de meta, tarjetas de agradecimiento), sin perder los datos guardados aquí.
        </p>
        <div className={`flex flex-col gap-3 ${donationsEnabled ? "" : "pointer-events-none opacity-40"}`}>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Enlace de PayPal</label>
            <input
              value={paypalLink}
              onChange={(e) => setPaypalLink(e.target.value)}
              placeholder="https://paypal.me/tu-usuario"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Número Yape</label>
            <input
              value={yapeNumber}
              onChange={(e) => setYapeNumber(e.target.value)}
              placeholder="999 999 999"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">URL de imagen QR de Yape (opcional)</label>
            <input
              value={yapeQrUrl}
              onChange={(e) => setYapeQrUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Share2 size={16} className="text-accent" />
          Redes sociales
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Facebook</label>
            <input
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              placeholder="https://facebook.com/tu-pagina"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Instagram</label>
            <input
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="https://instagram.com/tu-cuenta"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">X (Twitter)</label>
            <input
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="https://x.com/tu-cuenta"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">YouTube</label>
            <input
              value={socialYoutube}
              onChange={(e) => setSocialYoutube(e.target.value)}
              placeholder="https://youtube.com/@tu-canal"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">TikTok</label>
            <input
              value={socialTiktok}
              onChange={(e) => setSocialTiktok(e.target.value)}
              placeholder="https://tiktok.com/@tu-cuenta"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">WhatsApp</label>
            <input
              value={socialWhatsapp}
              onChange={(e) => setSocialWhatsapp(e.target.value)}
              placeholder="https://wa.me/519..."
              className={inputCls}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Los que dejes vacíos simplemente no se muestran en el pie de página.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Phone size={16} className="text-accent" />
          Contacto y pie de página
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Correo de contacto</label>
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contacto@tusitio.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Teléfono de contacto</label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+51 999 999 999"
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs text-white/50">
            Texto del pie de página (deja vacío para usar el de por defecto)
          </label>
          <input
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder={`© ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.`}
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || uploadingCount > 0}
        className="mt-2 flex w-fit items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={18} />
        {uploadingCount > 0 ? "Subiendo imagen..." : isPending ? "Guardando..." : "Guardar cambios"}
      </button>
      {saved && <p className="text-sm text-accent">Guardado correctamente.</p>}
    </form>
  );
}
