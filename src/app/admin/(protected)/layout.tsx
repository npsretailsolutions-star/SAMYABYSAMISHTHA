import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-cream">
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8">{children}</main>
    </div>
  );
}
