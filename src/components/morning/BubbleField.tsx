"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { AvailabilitySlot } from "@/lib/types";
import { MorningBubble } from "./MorningBubble";
import { cn } from "@/lib/utils";

interface BubbleFieldProps {
  slots: AvailabilitySlot[];
  onSelect: (slot: AvailabilitySlot) => void;
}

export function BubbleField({ slots, onSelect }: BubbleFieldProps) {
  const availableSlots = slots.filter((s) => s.status === "available");
  const otherSlots = slots.filter((s) => s.status !== "available");

  // Deterministic grid layout — bubbles arranged in a controlled grid
  const layoutSlots = useMemo(() => {
    if (availableSlots.length === 0) return [];

    // Use a grid-based layout with some organic offset
    const cols = Math.min(4, Math.ceil(Math.sqrt(availableSlots.length)));
    return availableSlots.map((slot, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      // Add slight offset for organic feel
      const offsetX = (row % 2) * 20;
      const offsetY = (i % 3) * 8;
      return { slot, row, col, offsetX, offsetY };
    });
  }, [availableSlots.length]);

  if (slots.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-4xl mb-4">{"\u{1F319}"}</span>
        <p className="text-lg text-text-secondary">
          No mornings are floating around yet.
        </p>
        <p className="text-sm text-text-muted mt-1">Check back soon.</p>
      </motion.div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-4xl mb-4">{"\u{2601}\u{FE0F}"}</span>
        <p className="text-lg text-text-secondary">
          Looks like someone caught them all.
        </p>
        <p className="text-sm text-text-muted mt-1">Try another month.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Available bubbles — the hero */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {layoutSlots.map(({ slot }, i) => (
          <MorningBubble
            key={slot.id}
            slot={slot}
            onClick={onSelect}
            index={i}
          />
        ))}
      </div>

      {/* Other status bubbles — secondary */}
      {otherSlots.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {otherSlots.map((slot, i) => (
            <MorningBubble
              key={slot.id}
              slot={slot}
              onClick={() => {}}
              index={availableSlots.length + i}
              isMobile
            />
          ))}
        </div>
      )}
    </div>
  );
}
