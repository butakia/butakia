import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NuevoArticuloPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white">Nuevo artículo</h1>
      <p className="mt-1 text-sm text-white/50">
        Escribe una noticia, actualización o artículo para el blog de Butakia.
      </p>
      <div className="mt-6">
        <BlogPostForm />
      </div>
    </div>
  );
}
