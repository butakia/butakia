import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  getPendingSubmissions,
  getOpenReportsCount,
  getPendingEditSuggestionsCount,
  getPremiumRequests,
} from "@/lib/data";
import { getOpenBookReportsCount } from "@/lib/books-data";
import { getCurrentUser } from "@/lib/dal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const [pending, reportsCount, editSuggestionsCount, premiumRequests, bookReportsCount] = await Promise.all([
    getPendingSubmissions(),
    getOpenReportsCount(),
    getPendingEditSuggestionsCount(),
    getPremiumRequests(),
    getOpenBookReportsCount(),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar
        pendingCount={pending.length}
        reportsCount={reportsCount}
        editSuggestionsCount={editSuggestionsCount}
        premiumRequestsCount={premiumRequests.length}
        bookReportsCount={bookReportsCount}
      />
      <div className="ml-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
