import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: slots, error } = await supabase
    .from("availability_slots")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots });
}
