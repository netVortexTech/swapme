"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { AvailabilitySlot } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MorningBubbleProps {
  slot: AvailabilitySlot;
  onClick: (slot: AvailabilitySlot) => void;
  index: number;
  isMobile?: boolean;
}

const statusConfig = {
  available: {
    emoji: "\u{1FAD7}",
    label: "Morning available",
    badge: "available",
    glow: "rgba(56, 189, 248, 0.15)",
  },
  pending: {
    emoji: "\u{2601}\u{FE0F}",
    label: "Awaiting approval",
    badge: "pending",
    glow: "rgba(251, 191, 36, 0.1)",
  },
  approved: {
    emoji: "\u{2728}",
    label: "Morning captured",
    badge: "approved",
    glow: "rgba(52, 211, 153, 0.1)",
  },
  cancelled: {
    emoji: "\u{1F32B}\u{FE0F}",
    label: "Available again",
    badge: "cancelled",
    glow: "rgba(139, 155, 184, 0.08)",
  },
  completed: {
    emoji: "\u{1F31F}",
    label: "Completed",
    badge: "completed",
    glow: "rgba(167, 139, 250, 0.1)",
  },
};

export function MorningBubble({ slot, onClick, index, isMobile }: MorningBubbleProps) {
  const config = statusConfig[slot.status];
  const date = parseISO(slot.date);
  const dayNumber = format(date, "d");
  const monthShort = format(date, "MMM");
  const isAvailable = slot.status === "available";

  // Deterministic float offset based on index
  const floatOffset = (index % 3) * 2 - 1; // -1, 0, 1
  const duration = 4 + (index % 3) * 0.5; // 4s, 4.5s, 5s

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-full",
            "border border-glass-border bg-glass-white backdrop-blur-md",
            "transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-800",
            isMobile ? "h-20 w-20" : "h-24 w-24",
            isAvailable && "cursor-pointer hover:scale-105 hover:border-glass-border-strong",
            !isAvailable && "cursor-default opacity-60"
          )}
          style={{
            boxShadow: `0 0 20px ${config.glow}`,
          }}
          whileHover={isAvailable ? { scale: 1.08 } : undefined}
          whileTap={isAvailable ? { scale: 0.95 } : undefined}
          onClick={() => isAvailable && onClick(slot)}
          disabled={!isAvailable}
          aria-label={`${format(date, "EEEE, MMMM d")} - ${config.label}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
        >
          {/* Inner glow */}
          <div
            className={cn(
              "absolute inset-1 rounded-full",
              "bg-gradient-to-br from-white/[0.08] to-transparent",
              "pointer-events-none"
            )}
          />

          {/* Float animation */}
          <motion.div
            className="flex flex-col items-center gap-0.5"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
          >
            <span className={cn("leading-none", isMobile ? "text-lg" : "text-xl")}>
              {config.emoji}
            </span>
            <span
              className={cn(
                "font-bold leading-none text-text-primary",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              {dayNumber}
            </span>
            <span
              className={cn(
                "uppercase leading-none text-text-muted",
                isMobile ? "text-[9px]" : "text-[10px]"
              )}
            >
              {monthShort}
            </span>
          </motion.div>

          {/* Hover ring */}
          {isAvailable && (
            <div
              className={cn(
                "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
                "group-hover:opacity-100",
                "border border-indigo-400/30"
              )}
              style={{
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.15)",
              }}
            />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-center">
        <p className="font-medium">{format(date, "EEEE, MMMM d")}</p>
        <p className="text-text-secondary">{config.label}</p>
        {isAvailable && (
          <p className="mt-1 text-indigo-400">Catch this morning &rarr;</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
