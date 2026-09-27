import { createClient } from "@/lib/supabase/server";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
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

  // Fetch slots for the current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .order("date", { ascending: true });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Calendar</h1>
      <AdminCalendar slots={slots || []} />
    </div>
  );
}
