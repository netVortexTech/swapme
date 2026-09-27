import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: Request) {
  return updateSession(request as any);
}

export const config = {
  matcher: ["/admin/:path*"],
};
