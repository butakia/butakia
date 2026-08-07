import BookForm from "@/components/BookForm";
import { getTags, getSiteSettings } from "@/lib/data";

export default async function NuevoLibroPage() {
  const [tags, settings] = await Promise.all([getTags(), getSiteSettings()]);
  return (
    <div>
      <h1 className="text-2xl font-black text-white">Agregar libro</h1>
      <p className="mt-1 text-sm text-white/50">
        Sube la portada, pega el texto de la obra y completa la declaración de derechos para publicar.
      </p>
      <div className="mt-6">
        <BookForm tags={tags} pdfUploadEnabled={settings.pdfUploadEnabled} />
      </div>
    </div>
  );
}
