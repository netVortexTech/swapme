import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RequestQueue } from "@/components/admin/RequestQueue";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!admin) {
    redirect("/admin/login?error=unauthorized");
  }

  // Fetch stats
  const [
    { count: available },
    { count: pending },
    { count: approved },
    { count: upcoming },
  ] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("availability_slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("date", new Date().toISOString().split("T")[0]),
  ]);

  const stats = {
    available: available || 0,
    pending: pending || 0,
    approved: approved || 0,
    upcoming: upcoming || 0,
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Dashboard</h1>
      <DashboardStats stats={stats} />
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Recent Requests
        </h2>
        <RequestQueue />
      </div>
    </div>
  );
}
