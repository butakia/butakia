"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";

interface ImportResult {
  tablesRestored: number;
  rowsRestored: number;
  filesRestored: number;
}

export default function BackupManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/backup", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo restaurar el respaldo.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restaurar el respaldo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
        id="backup-upload"
      />
      <label
        htmlFor="backup-upload"
        className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
      >
        <UploadCloud size={16} />
        {uploading ? "Restaurando..." : "Restaurar desde un archivo .zip"}
      </label>

      {result && (
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <CheckCircle2 size={14} />
          Restaurado: {result.tablesRestored} tablas, {result.rowsRestored} filas,{" "}
          {result.filesRestored} imágenes.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertTriangle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
