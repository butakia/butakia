import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileManager from "@/components/ProfileManager";
import { getProfilesForUser, getSiteSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "¿Quién está viendo?",
  robots: { index: false, follow: false },
};

export default async function PerfilesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profiles, settings] = await Promise.all([
    getProfilesForUser(user.id),
    getSiteSettings(),
  ]);

  const limit = settings.profilesPremiumOnly && !user.isPremium ? 1 : settings.maxProfilesFree;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28">
        <ProfileManager
          profiles={profiles}
          limit={limit}
          isPremium={user.isPremium}
          profilesPremiumOnly={settings.profilesPremiumOnly}
        />
      </main>
      <Footer />
    </>
  );
}
