import { getAllPosts } from "@/lib/blog-data";
import BlogPostsManager from "@/components/admin/BlogPostsManager";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Blog</h1>
      <p className="mt-1 text-sm text-white/50">
        Publica noticias, actualizaciones y artículos que aparecerán en la sección de Blog del sitio.
      </p>
      <div className="mt-6">
        <BlogPostsManager posts={posts} />
      </div>
    </div>
  );
}
