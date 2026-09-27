import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { slots } = body;

  if (!slots || !Array.isArray(slots)) {
    return NextResponse.json({ error: "Invalid slots data" }, { status: 400 });
  }

  const supabase = await createClient();

  // Insert slots, ignoring duplicates
  const { data, error } = await supabase
    .from("availability_slots")
    .upsert(
      slots.map((slot: { date: string; period: string }) => ({
        date: slot.date,
        period: slot.period || "morning",
        status: "available",
      })),
      { onConflict: "date,period" }
    )
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots: data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing slot id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
