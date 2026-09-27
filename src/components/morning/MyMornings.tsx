"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import type { Booking } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MyMorningsProps {
  bookings: Booking[];
}

const statusBadge: Record<string, { variant: string; label: string }> = {
  pending: { variant: "pending", label: "Pending" },
  approved: { variant: "approved", label: "Approved" },
  rejected: { variant: "rejected", label: "Rejected" },
  cancelled: { variant: "cancelled", label: "Cancelled" },
  completed: { variant: "completed", label: "Completed" },
};

export function MyMornings({ bookings }: MyMorningsProps) {
  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-12 text-center"
      >
        <span className="text-3xl mb-3">{"\u{1F324}\u{FE0F}"}</span>
        <p className="text-text-secondary">You haven't caught a morning yet.</p>
        <p className="text-sm text-text-muted mt-1">
          There are still some floating around.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, i) => {
        const slot = booking.slot;
        if (!slot) return null;
        const date = parseISO(slot.date);
        const badge = statusBadge[booking.status];

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center justify-between rounded-xl border border-glass-border bg-glass-white px-4 py-3",
              "backdrop-blur-md"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {booking.status === "approved"
                  ? "\u{2728}"
                  : booking.status === "pending"
                  ? "\u{2601}\u{FE0F}"
                  : booking.status === "completed"
                  ? "\u{1F31F}"
                  : "\u{1F32B}\u{FE0F}"}
              </span>
              <div>
                <p className="font-medium text-text-primary">
                  {format(date, "MMMM d")}
                </p>
                <p className="text-xs text-text-muted">Morning</p>
              </div>
            </div>
            <Badge variant={badge.variant as any}>{badge.label}</Badge>
          </motion.div>
        );
      })}
    </div>
  );
}
