import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LiteraryAuthorForm from "@/components/admin/LiteraryAuthorForm";

export default async function EditarAutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await prisma.literaryAuthor.findUnique({
    where: { id },
    include: { books: false },
  });
  const claimedUser = author?.userId ? await prisma.user.findUnique({ where: { id: author.userId } }) : null;

  if (!author) {
    return (
      <div>
        <p className="text-white/60">No se encontró ese autor.</p>
        <Link href="/admin/libros-autores" className="mt-2 inline-block text-accent hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Editar: {author.name}</h1>
      <div className="mt-6">
        <LiteraryAuthorForm
          id={author.id}
          initialPhotoUrl={author.photoUrl ?? undefined}
          initialBio={author.bio ?? undefined}
          initialVerified={author.verified}
          claimedByUserName={claimedUser?.name}
        />
      </div>
    </div>
  );
}
