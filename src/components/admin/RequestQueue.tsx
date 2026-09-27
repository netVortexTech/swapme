"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Check, X, Loader2 } from "lucide-react";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RequestQueue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (bookingId: string, action: "approved" | "rejected") => {
    setActionLoading(bookingId);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, action }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-glass-white" />
        ))}
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const past = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Pending</h3>
          {pending.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-glass-border bg-glass-white p-4 backdrop-blur-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{"\u{1F305}"}</span>
                    <span className="font-medium text-text-primary">
                      {booking.slot ? format(parseISO(booking.slot.date), "MMMM d") : "Unknown"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {booking.employee_name} · {booking.employee_email}
                  </p>
                  {booking.message && (
                    <p className="mt-2 text-sm text-text-muted italic">
                      &quot;{booking.message}&quot;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-text-muted">
                    Requested {format(parseISO(booking.created_at), "MMM d, HH:mm")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction(booking.id, "approved")}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(booking.id, "rejected")}
                    disabled={actionLoading === booking.id}
                  >
                    <X />
                    Reject
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Past requests */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">History</h3>
          {past.slice(0, 10).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-white/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span>
                  {booking.status === "approved"
                    ? "\u{2728}"
                    : booking.status === "completed"
                    ? "\u{1F31F}"
                    : "\u{1F32B}\u{FE0F}"}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {booking.employee_name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {booking.slot ? format(parseISO(booking.slot.date), "MMM d") : "Unknown"}
                  </p>
                </div>
              </div>
              <Badge variant={booking.status as any}>{booking.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-text-secondary">No booking requests yet.</p>
        </div>
      )}
    </div>
  );
}
