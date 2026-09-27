import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
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
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Settings</h1>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-glass-border bg-glass-white p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-text-primary">Admin Profile</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Signed in as {user.email}
          </p>
        </div>
        <div className="rounded-xl border border-glass-border bg-glass-white p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-text-primary">About</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Catch a Morning — Internal booking application.
            <br />
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
