"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Link2, Upload } from "lucide-react";

export default function ImageDropzone({
  label,
  required,
  aspect = "aspect-[2/3]",
  shape = "square",
  initialUrl,
  onChange,
  onUploadingChange,
}: {
  label: string;
  required?: boolean;
  aspect?: string;
  shape?: "square" | "circle";
  initialUrl?: string;
  onChange?: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  // "url" is the default/recommended path — it costs nothing on our own image
  // storage since the browser just loads it straight from wherever it's hosted.
  // "upload" (through Cloudinary) stays available for people who don't already
  // have the image hosted somewhere.
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [urlInput, setUrlInput] = useState(initialUrl ?? "");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyUrl = (value: string) => {
    const trimmed = value.trim();
    setError(null);
    setPreview(trimmed || null);
    onChange?.(trimmed || null);
  };

  const uploadFile = async (file: File) => {
    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la imagen.");
      setPreview(data.url);
      setUrlInput(data.url);
      onChange?.(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir la imagen.");
      setPreview(null);
      onChange?.(null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const clear = () => {
    setPreview(null);
    setUrlInput("");
    setError(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground/90">
        {label} {required && <span className="text-accent">*</span>}
      </label>

      <div className="mb-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            mode === "url" ? "bg-accent text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <Link2 size={11} />
          Pegar URL
          <span className={mode === "url" ? "text-white/80" : "text-white/30"}>· recomendado</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            mode === "upload" ? "bg-accent text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <Upload size={11} />
          Subir archivo
        </button>
      </div>

      {mode === "url" ? (
        <div className={`flex ${aspect} w-full max-w-[200px] flex-col gap-2`}>
          <div
            className={`relative flex flex-1 items-center justify-center overflow-hidden border-2 border-dashed ${
              shape === "circle" ? "rounded-full" : "rounded-lg"
            } border-white/15 bg-white/5`}
          >
            {preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Quitar imagen"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center text-white/40">
                <Link2 size={20} />
                <span className="text-xs">Pega la URL de una imagen abajo</span>
              </div>
            )}
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={() => applyUrl(urlInput)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl(urlInput);
              }
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) uploadFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex ${aspect} w-full max-w-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed transition-colors ${
            shape === "circle" ? "rounded-full" : "rounded-lg"
          } ${dragOver ? "border-accent bg-accent/10" : "border-white/15 bg-white/5 hover:border-white/30"}`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="h-full w-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 size={22} className="animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                aria-label="Quitar imagen"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center text-white/50">
              <ImagePlus size={24} />
              <span className="text-xs">Arrastra o haz clic</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </div>
  );
}
