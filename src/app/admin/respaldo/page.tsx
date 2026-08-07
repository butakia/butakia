import { Database, Download, ShieldAlert } from "lucide-react";
import BackupManager from "@/components/admin/BackupManager";

export default function AdminRespaldoPage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Database size={22} className="text-accent" />
        <h1 className="text-2xl font-black text-white">Respaldo de datos</h1>
      </div>
      <p className="mt-1 text-sm text-white/50">
        Descarga o restaura toda la información de Butakia: títulos, usuarios, comentarios,
        colaboradores, perfiles, y también todo Butakia Libros — libros, capítulos y su texto
        completo, PDFs subidos, subrayados de usuarios, progreso de lectura, reseñas y anuncios —
        junto con todas las imágenes y PDFs subidos en{" "}
        <code className="text-white/70">/public/uploads</code>.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-white">
          <Download size={17} className="text-accent" />
          Exportar
        </h2>
        <p className="mb-3 text-sm text-white/60">
          Genera un archivo .zip con toda la base de datos (en JSON) y las imágenes subidas. Puedes
          usarlo para migrar Butakia a otro hosting.
        </p>
        <a
          href="/api/admin/backup"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Download size={16} />
          Descargar respaldo completo (.zip)
        </a>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-2 font-bold text-white">Restaurar / importar</h2>
        <p className="mb-3 text-sm text-white/60">
          Sube un .zip generado por este mismo botón. Los datos se combinan por ID (no se borra
          nada existente): si un registro ya existe se actualiza, si no existe se crea. Las
          imágenes se copian a <code className="text-white/70">/public/uploads</code>.
        </p>
        <BackupManager />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-yellow-500" />
        <div className="text-sm text-white/70">
          <p className="font-semibold text-white">Cómo migrar Butakia a otro hosting, paso a paso:</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4">
            <li>En el sitio actual: descarga el respaldo completo con el botón de arriba.</li>
            <li>
              Instala Butakia en el nuevo hosting (mismo código del proyecto) y créalo con la base
              de datos vacía.
            </li>
            <li>Entra a esta misma página en el sitio nuevo y sube el .zip para restaurar.</li>
            <li>
              <strong>Importante:</strong> este respaldo NO incluye tu archivo{" "}
              <code>.env</code> (contraseñas de sesión, credenciales de Google, etc.) por
              seguridad — esos valores debes copiarlos tú manualmente al nuevo hosting.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
