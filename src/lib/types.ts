export type SlotStatus =
  | "available"
  | "pending"
  | "approved"
  | "cancelled"
  | "completed";

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type Period = "morning" | "afternoon";

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  period: Period;
  status: SlotStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  availability_slot_id: string;
  employee_name: string;
  employee_email: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  slot?: AvailabilitySlot;
}

export interface Admin {
  id: string;
  user_id: string;
  created_at: string;
}

export interface ParsedSlot {
  date: string;
  period: Period;
}

export interface ParseResult {
  month: string;
  slots: ParsedSlot[];
  uncertain_items: Array<{
    raw: string;
    possible_dates: string[];
  }>;
}

export interface DashboardStats {
  available: number;
  pending: number;
  approved: number;
  upcoming: number;
}
