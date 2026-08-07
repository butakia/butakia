"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, FileText, Type, PenLine, Search, ShieldCheck, Loader2, DollarSign } from "lucide-react";
import { createBookAction, updateBookAction, publishBookAction, submitBookForSaleAction, BookFormInput } from "@/lib/books-actions";
import { Book, Tag as TagType } from "@/lib/types";
import ImageDropzone from "@/components/ImageDropzone";
import { isRealImage } from "@/components/PosterPlaceholder";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { SEO_TITLE_TEMPLATES_LIBROS } from "@/lib/seo-templates";
import TagInput from "@/components/TagInput";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

const DEFAULT_GENRES = [
  "Terror",
  "Comedia",
  "Ironía",
  "Romance",
  "Drama",
  "Ciencia Ficción",
  "Fantasía",
  "Aventura",
  "Misterio",
  "Poesía",
  "Ensayo",
  "Cuentos",
  "Novela",
  "Dominio Público",
];

export default function BookForm({
  initial,
  mode = "admin",
  tags: availableTags = [],
  pdfUploadEnabled = true,
}: {
  initial?: Book;
  mode?: "admin" | "public";
  tags?: TagType[];
  pdfUploadEnabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [year, setYear] = useState(String(initial?.year ?? ""));
  const [language, setLanguage] = useState(initial?.language ?? "Español");
  const [isbn, setIsbn] = useState(initial?.isbn ?? "");
  const [synopsis, setSynopsis] = useState(initial?.synopsis ?? "");
  const [genres, setGenres] = useState<string[]>(initial?.genres ?? []);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [badges, setBadges] = useState<string[]>(initial?.badges ?? []);
  const [cover, setCover] = useState<string | null>(
    initial && isRealImage(initial.cover) ? initial.cover : null
  );
  const [sourceKind, setSourceKind] = useState<"pdf_upload" | "pasted_text" | "editor">(
    initial?.sourceKind ?? "pasted_text"
  );
  const [rawText, setRawText] = useState("");
  const [rawHtml, setRawHtml] = useState("<p></p>");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | undefined>(undefined);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(initial?.isFree ?? true);
  const [wantsToSell, setWantsToSell] = useState(false);
  const [priceUsd, setPriceUsd] = useState("");
  const [commercialDesc, setCommercialDesc] = useState("");
  const [discountAllowed, setDiscountAllowed] = useState(false);
  const [promotionAllowed, setPromotionAllowed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status === "published" ? "published" : "draft"
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(initial?.seoKeywords ?? []);
  const [rightsBasis, setRightsBasis] = useState<"owner" | "public_domain" | "authorized">("owner");
  const [rightsAccepted, setRightsAccepted] = useState(isEdit);
  const [showUploader, setShowUploader] = useState(initial?.showUploader ?? true);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const rightsRef = useRef<HTMLDivElement>(null);

  const contentMissing =
    !isEdit &&
    ((sourceKind === "pasted_text" && !rawText.trim()) ||
      (sourceKind === "pdf_upload" && !pdfUrl) ||
      (sourceKind === "editor" && rawHtml.replace(/<[^>]+>/g, "").trim().length === 0));

  const missingItems: { label: string; ref: React.RefObject<HTMLElement | null> }[] = [
    ...(!title.trim() ? [{ label: "Falta el título.", ref: titleRef }] : []),
    ...(!authorName.trim() ? [{ label: "Falta el autor.", ref: authorRef }] : []),
    ...(contentMissing ? [{ label: "Falta el contenido de tu obra (texto, PDF o editor).", ref: contentRef }] : []),
    ...(wantsToSell && !priceUsd ? [{ label: "Falta el precio de venta.", ref: priceRef }] : []),
    ...(wantsToSell && !phoneNumber.trim() ? [{ label: "Falta el número de WhatsApp.", ref: phoneRef }] : []),
    ...(!isEdit && !rightsAccepted ? [{ label: "Debes aceptar la declaración de derechos.", ref: rightsRef }] : []),
  ];

  const scrollToFirstMissing = () => {
    const first = missingItems[0];
    if (!first) return;
    first.ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    first.ref.current?.focus?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missingItems.length > 0) {
      setAttemptedSubmit(true);
      scrollToFirstMissing();
      return;
    }

    const payload: BookFormInput = {
      title,
      subtitle: subtitle || undefined,
      authorName,
      publisher: publisher || undefined,
      year: year && !Number.isNaN(Number(year)) ? Number(year) : undefined,
      language: language || undefined,
      isbn: isbn || undefined,
      synopsis,
      cover: cover || undefined,
      genres,
      tags,
      badges,
      contentType: sourceKind === "pdf_upload" ? "pdf" : sourceKind === "editor" ? "richtext" : "text",
      sourceKind,
      rawText: sourceKind === "pasted_text" ? rawText : undefined,
      rawHtml: sourceKind === "editor" ? rawHtml : undefined,
      pdfUrl: sourceKind === "pdf_upload" ? pdfUrl || undefined : undefined,
      pageCount: sourceKind === "pdf_upload" ? pdfPageCount : undefined,
      isFree: wantsToSell ? false : isFree,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords,
      rightsBasis,
      showUploader,
    };

    startTransition(async () => {
      if (isEdit && initial) {
        await updateBookAction(initial.slug, payload);
        router.push("/admin/libros");
      } else if (mode === "public") {
        const book = await publishBookAction(payload);
        if (wantsToSell && priceUsd && phoneNumber) {
          await submitBookForSaleAction(book.id, {
            priceUsd: Number(priceUsd),
            commercialDesc: commercialDesc || undefined,
            discountAllowed,
            promotionAllowed,
            phoneNumber,
          });
        }
        router.push(`/libros/${book.slug}`);
      } else {
        await createBookAction(payload);
        router.push("/admin/libros");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="mb-6">
        <ImageDropzone label="Portada" initialUrl={cover ?? undefined} onChange={setCover} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Título *">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputCls} ${attemptedSubmit && !title.trim() ? "border-red-500/60" : ""}`}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Subtítulo">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Autor *">
          <input
            ref={authorRef}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={`${inputCls} ${attemptedSubmit && !authorName.trim() ? "border-red-500/60" : ""}`}
          />
        </Field>
        <Field label="Editorial">
          <input value={publisher} onChange={(e) => setPublisher(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Año">
          <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Idioma">
          <input value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls} />
        </Field>
        <Field label="ISBN">
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Géneros (escribe y presiona Enter)">
          <TagInput value={genres} onChange={setGenres} placeholder="Género..." />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DEFAULT_GENRES.map((g) => {
              const active = genres.some((x) => x.toLowerCase() === g.toLowerCase());
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGenres((prev) =>
                      active
                        ? prev.filter((x) => x.toLowerCase() !== g.toLowerCase())
                        : [...prev, g]
                    );
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    active ? "border-accent bg-accent/15 text-accent" : "border-white/15 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="md:col-span-2">
          <Field label="Etiquetas (escribe y presiona Enter)">
            <TagInput value={tags} onChange={setTags} placeholder="Etiqueta..." />
          </Field>
        </div>
        {mode === "admin" && (
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm text-white/70">
              Etiquetas destacadas{" "}
              <a href="/admin/etiquetas" target="_blank" className="text-xs text-accent hover:underline">
                (crear nuevas)
              </a>
            </label>
            {availableTags.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/40">
                Aún no has creado etiquetas.{" "}
                <a href="/admin/etiquetas" target="_blank" className="text-accent hover:underline">
                  Créalas aquí
                </a>{" "}
                y luego asígnalas a este libro.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((t) => {
                  const active = badges.includes(t.label);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setBadges((prev) =>
                          prev.includes(t.label) ? prev.filter((x) => x !== t.label) : [...prev, t.label]
                        )
                      }
                      style={active ? { backgroundColor: `${t.color}26`, borderColor: t.color, color: t.color } : undefined}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                        active ? "" : "border-white/15 text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="md:col-span-2">
          <Field label="Sinopsis">
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </div>

      {!isEdit && (
        <div ref={contentRef} tabIndex={-1} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/70">Contenido</h3>
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSourceKind("pasted_text")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                sourceKind === "pasted_text"
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/60 hover:bg-white/5"
              }`}
            >
              <Type size={16} />
              Pegar texto
            </button>
            {pdfUploadEnabled && (
              <button
                type="button"
                onClick={() => setSourceKind("pdf_upload")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  sourceKind === "pdf_upload"
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/15 text-white/60 hover:bg-white/5"
                }`}
              >
                <FileText size={16} />
                Subir PDF
              </button>
            )}
            <button
              type="button"
              onClick={() => setSourceKind("editor")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                sourceKind === "editor"
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/60 hover:bg-white/5"
              }`}
            >
              <PenLine size={16} />
              Escribir en Butakia
            </button>
          </div>

          {sourceKind === "pasted_text" && (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              placeholder="Pega aquí el texto completo del libro. Se dividirá automáticamente en páginas."
              className={`${inputCls} resize-y`}
            />
          )}

          {sourceKind === "pdf_upload" && (
            <div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60 hover:border-white/30">
                {pdfUploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                {pdfUploading
                  ? "Subiendo y analizando PDF..."
                  : pdfUrl
                    ? `PDF cargado (${pdfPageCount ?? "?"} páginas). Haz clic para reemplazar.`
                    : "Haz clic para seleccionar un archivo PDF (máx. 50MB)"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPdfUploading(true);
                    setPdfError(null);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch("/api/upload/book-pdf", { method: "POST", body: formData });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Error al subir el PDF.");
                      setPdfUrl(data.url);
                      setPdfPageCount(data.pageCount);
                    } catch (err) {
                      setPdfError(err instanceof Error ? err.message : "Error al subir el PDF.");
                    } finally {
                      setPdfUploading(false);
                    }
                  }}
                />
              </label>
              {pdfError && <p className="mt-2 text-xs text-red-400">{pdfError}</p>}
            </div>
          )}

          {sourceKind === "editor" && <RichTextEditor content={rawHtml} onChange={setRawHtml} />}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label className={`flex items-center gap-2 text-sm text-white/80 ${wantsToSell ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
          <input
            type="checkbox"
            checked={wantsToSell ? false : isFree}
            disabled={wantsToSell}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Libro gratuito
        </label>
        {mode === "admin" && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={status === "published"}
              onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
              className="h-4 w-4 accent-accent"
            />
            Publicado
          </label>
        )}
      </div>

      {mode === "public" && !isEdit && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={wantsToSell}
              onChange={(e) => setWantsToSell(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <DollarSign size={15} className="text-accent" />
            Deseo vender este libro
          </label>

          {wantsToSell && (
            <div className="mt-4 flex flex-col gap-4">
              <p className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-500">
                Toda obra puesta a la venta pasa por una validación manual antes de habilitar la compra.
                El equipo de Butakia te contactará por WhatsApp para verificar tu identidad y titularidad
                de derechos. Mientras tanto, tu libro permanece visible pero no disponible para compra.
              </p>
              <Field label="Precio (USD) *">
                <input
                  ref={priceRef}
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Descripción comercial">
                <textarea
                  value={commercialDesc}
                  onChange={(e) => setCommercialDesc(e.target.value)}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Número de teléfono (WhatsApp) *">
                <input
                  ref={phoneRef}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+51 999 999 999"
                  className={inputCls}
                />
              </Field>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={discountAllowed}
                    onChange={(e) => setDiscountAllowed(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Permitir descuentos futuros
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={promotionAllowed}
                    onChange={(e) => setPromotionAllowed(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Permitir promociones de Butakia
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Search size={16} className="text-accent" />
          Posicionamiento en Google (SEO)
        </h3>

        <div className="mb-4">
          <p className="mb-1.5 text-xs text-white/50">Plantillas rápidas (según lo que la gente busca)</p>
          <div className="flex flex-wrap gap-2">
            {SEO_TITLE_TEMPLATES_LIBROS.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  const t = title || "este libro";
                  setSeoTitle(tpl.build(t));
                  setSeoDescription(
                    `Lee ${t} online gratis en español, sin cortes ni anuncios molestos. ${
                      synopsis?.slice(0, 100) ?? ""
                    }`
                  );
                  setSeoKeywords([
                    `leer ${t} online gratis`,
                    `${t} pdf español`,
                    `${t} descargar gratis`,
                    `${t} sin anuncios`,
                  ]);
                }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-accent/60 hover:text-white"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Título para buscadores">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`Leer ${title || "..."} Gratis Online`}
              className={inputCls}
            />
          </Field>
          <Field label="Descripción para buscadores">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Palabras clave (escribe y presiona Enter)">
            <TagInput value={seoKeywords} onChange={setSeoKeywords} placeholder="Palabra clave..." />
          </Field>
        </div>
      </div>

      {mode === "public" && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={showUploader}
              onChange={(e) => setShowUploader(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Mostrar mi nombre como quien subió esta obra
          </label>
        </div>
      )}

      {!isEdit && (
        <div ref={rightsRef} tabIndex={-1} className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck size={16} className="text-accent" />
            Declaración de derechos de autor
          </h3>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            {(
              [
                { value: "owner", label: "Soy el titular de los derechos de autor de esta obra." },
                { value: "public_domain", label: "La obra pertenece al dominio público." },
                { value: "authorized", label: "Poseo autorización suficiente para distribuirla." },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="rightsBasis"
                  checked={rightsBasis === opt.value}
                  onChange={() => setRightsBasis(opt.value)}
                  className="h-4 w-4 accent-accent"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-2 border-t border-white/10 pt-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={rightsAccepted}
              onChange={(e) => setRightsAccepted(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 accent-accent"
            />
            Declaro bajo juramento que la afirmación seleccionada es verdadera y acepto toda responsabilidad legal derivada de una declaración falsa.
          </label>
        </div>
      )}

      {attemptedSubmit && missingItems.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          <p className="font-semibold">Falta completar:</p>
          <ul className="mt-1 list-inside list-disc">
            {missingItems.map((m) => (
              <li key={m.label}>{m.label}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={18} />
        {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar libro"}
      </button>
    </form>
  );
}
