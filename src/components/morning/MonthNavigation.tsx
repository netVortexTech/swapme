"use client";

import { motion } from "framer-motion";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigationProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function MonthNavigation({
  currentDate,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: MonthNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="Previous month"
        className="rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <motion.h2
        key={format(currentDate, "yyyy-MM")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-[180px] text-center text-2xl font-semibold tracking-tight text-text-primary"
      >
        {format(currentDate, "MMMM yyyy")}
      </motion.h2>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next month"
        className="rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
