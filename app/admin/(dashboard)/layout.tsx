import { redirect } from "next/navigation";
import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseAuthedServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminNav />
      <main className="mx-auto max-w-[1100px] px-4 py-5">{children}</main>
    </div>
  );
}
