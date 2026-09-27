"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import type { AvailabilitySlot, Booking } from "@/lib/types";
import { BubbleField } from "@/components/morning/BubbleField";
import { BookingDialog } from "@/components/morning/BookingDialog";
import { BookingSuccess } from "@/components/morning/BookingSuccess";
import { MonthNavigation } from "@/components/morning/MonthNavigation";
import { MyMornings } from "@/components/morning/MyMornings";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successDate, setSuccessDate] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth).toISOString().split("T")[0];
      const monthEnd = endOfMonth(currentMonth).toISOString().split("T")[0];
      const res = await fetch(`/api/slots?start=${monthStart}&end=${monthEnd}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingOpen(false);
    setSuccessDate(selectedSlot?.date || null);
    setSuccessOpen(true);
    fetchSlots();
    fetchBookings();
  };

  const handlePrevMonth = () => setCurrentMonth((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentMonth((d) => addMonths(d, 1));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px w-px rounded-full bg-white/30"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 100}%`,
                opacity: 0.2 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-peach-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lavender-500/3 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            Catch a Morning {"\u{1F305}"}
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            Pick a morning. Pop a bubble. Let&apos;s make it happen.
          </p>
        </motion.div>

        {/* Month navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <MonthNavigation
            currentDate={currentMonth}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            hasPrev={true}
            hasNext={true}
          />
        </motion.div>

        {/* Bubble field */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          {loading ? (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-24 rounded-full"
                />
              ))}
            </div>
          ) : (
            <BubbleField slots={slots} onSelect={handleSelectSlot} />
          )}
        </motion.div>

        {/* My Mornings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-md"
        >
          <h3 className="mb-4 text-center text-lg font-semibold text-text-primary">
            My Mornings {"\u{1F324}\u{FE0F}"}
          </h3>
          <MyMornings bookings={bookings} />
        </motion.div>
      </div>

      {/* Booking dialog */}
      <BookingDialog
        slot={selectedSlot}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Success dialog */}
      <BookingSuccess
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        date={successDate}
      />
    </div>
  );
}
