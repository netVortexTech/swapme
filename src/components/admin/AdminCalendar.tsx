"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AvailabilitySlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminCalendarProps {
  slots: AvailabilitySlot[];
}

const statusColors: Record<string, string> = {
  available: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-glass-white text-text-muted border-glass-border",
  completed: "bg-lavender-500/20 text-lavender-400 border-lavender-500/30",
};

export function AdminCalendar({ slots }: AdminCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const getSlotsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return slots.filter((s) => s.date === dateStr);
  };

  const selectedSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-glass-border bg-glass-white p-4 backdrop-blur-md">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-text-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}

          {days.map((day) => {
            const daySlots = getSlotsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-all",
                  "hover:bg-glass-white",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                  isSelected && "bg-indigo-500/20 text-indigo-400",
                  isToday && !isSelected && "bg-glass-white/50",
                  !isCurrentMonth && "opacity-30"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    isToday && "text-indigo-400"
                  )}
                >
                  {format(day, "d")}
                </span>
                {daySlots.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {daySlots.slice(0, 3).map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          statusColors[slot.status]?.split(" ")[0] || "bg-sky-500"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-glass-border bg-glass-white p-4 backdrop-blur-md"
        >
          <h3 className="mb-3 font-medium text-text-primary">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          {selectedSlots.length > 0 ? (
            <div className="space-y-2">
              {selectedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg bg-glass-white px-3 py-2"
                >
                  <span className="text-sm text-text-primary">
                    {slot.period === "morning" ? "Morning" : "Afternoon"}
                  </span>
                  <Badge variant={slot.status as any}>{slot.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No slots for this date.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
