import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getPremiumRequests } from "@/lib/data";
import { getOpenBookReportsCount } from "@/lib/books-data";
import { getCurrentUser } from "@/lib/dal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const [premiumRequests, bookReportsCount] = await Promise.all([
    getPremiumRequests(),
    getOpenBookReportsCount(),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar
        premiumRequestsCount={premiumRequests.length}
        bookReportsCount={bookReportsCount}
      />
      <div className="ml-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
