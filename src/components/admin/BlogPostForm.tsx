"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Search } from "lucide-react";
import { createBlogPostAction, updateBlogPostAction } from "@/lib/blog-actions";
import { BlogPost } from "@/lib/types";
import ImageDropzone from "@/components/ImageDropzone";
import { isRealImage } from "@/components/PosterPlaceholder";
import RichTextEditor from "@/components/editor/RichTextEditor";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

const CATEGORIES: { value: BlogPost["category"]; label: string }[] = [
  { value: "noticia", label: "Noticia" },
  { value: "actualizacion", label: "Actualización" },
  { value: "articulo", label: "Artículo" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
}

export default function BlogPostForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [category, setCategory] = useState<BlogPost["category"]>(initial?.category ?? "noticia");
  const [status, setStatus] = useState<BlogPost["status"]>(initial?.status ?? "draft");
  const [coverImage, setCoverImage] = useState<string | null>(
    initial && initial.coverImage && isRealImage(initial.coverImage) ? initial.coverImage : null
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  // Guards against submitting before an image finishes uploading — saving mid-upload
  // used to persist before the real URL came back, silently dropping the cover.
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      excerpt,
      content,
      category,
      status,
      coverImage: coverImage || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    startTransition(async () => {
      if (isEdit && initial) {
        await updateBlogPostAction(initial.slug, payload);
        router.push("/admin/blog");
      } else {
        const slug = await createBlogPostAction(payload);
        router.push("/admin/blog");
        void slug;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-5">
      <ImageDropzone
        label="Imagen de portada"
        aspect="aspect-video"
        initialUrl={coverImage ?? undefined}
        onChange={setCoverImage}
        onUploadingChange={setUploading}
      />

      <Field label="Título *">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
      </Field>

      <Field label="Resumen (aparece en la lista del blog)">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Categoría</label>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                category === c.value
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/60 hover:bg-white/5"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Contenido</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Search size={16} className="text-accent" />
          Posicionamiento en Google (SEO)
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Título para buscadores (opcional)">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title}
              className={inputCls}
            />
          </Field>
          <Field label="Descripción para buscadores (opcional)">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              placeholder={excerpt}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-sm text-white/80">Publicar (visible en el sitio)</span>
        <input
          type="checkbox"
          checked={status === "published"}
          onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
          className="h-4 w-4 accent-accent"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || uploading || !title.trim()}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-40"
      >
        <Save size={16} />
        {uploading ? "Subiendo imagen..." : isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar artículo"}
      </button>
    </form>
  );
}
