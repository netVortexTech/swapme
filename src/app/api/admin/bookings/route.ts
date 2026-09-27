import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, slot:availability_slots(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { booking_id, action } = body;

  if (!booking_id || !["approved", "rejected", "cancelled", "completed"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      status: action,
      approved_at: action === "approved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking_id);

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Update slot status to match
  const { data: booking } = await supabase
    .from("bookings")
    .select("availability_slot_id")
    .eq("id", booking_id)
    .single();

  if (booking) {
    const slotStatus =
      action === "approved"
        ? "approved"
        : action === "rejected"
        ? "available"
        : action === "cancelled"
        ? "available"
        : "completed";

    await supabase
      .from("availability_slots")
      .update({ status: slotStatus, updated_at: new Date().toISOString() })
      .eq("id", booking.availability_slot_id);
  }

  return NextResponse.json({ success: true });
}
