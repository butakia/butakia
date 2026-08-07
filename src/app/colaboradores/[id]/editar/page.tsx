import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorEditForm from "@/components/ContributorEditForm";
import { getContributorById, getNameCooldownStatus } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export default async function EditContributorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contributor, user] = await Promise.all([getContributorById(id), getCurrentUser()]);
  if (!contributor) notFound();
  if (!user || user.id !== contributor.userId) redirect(`/colaboradores/${id}`);

  const { canChange, daysLeft } = await getNameCooldownStatus(id);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-28">
        <h1 className="mb-6 text-2xl font-black text-white">Editar mi perfil</h1>
        <ContributorEditForm
          contributor={contributor}
          canChangeName={canChange}
          daysUntilNameChange={daysLeft}
        />
      </main>
      <Footer />
    </>
  );
}
