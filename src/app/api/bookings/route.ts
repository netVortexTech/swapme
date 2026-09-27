import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, slot:availability_slots(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { slot_id, employee_name, employee_email, message } = body;

  if (!slot_id || !employee_name || !employee_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createClient();

  // Atomic booking: update slot + insert booking in a transaction
  // The unique constraint on bookings prevents double-booking
  const { data: booking, error } = await supabase.rpc("create_booking", {
    p_slot_id: slot_id,
    p_employee_name: employee_name,
    p_employee_email: employee_email,
    p_message: message || null,
  });

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation — slot already taken
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
