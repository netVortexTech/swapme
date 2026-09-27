import { createClient } from "@/lib/supabase/server";
import { RequestQueue } from "@/components/admin/RequestQueue";
import { redirect } from "next/navigation";

export default async function RequestsPage() {
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

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Requests</h1>
      <RequestQueue />
    </div>
  );
}
