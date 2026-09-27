"use client";

import { motion } from "framer-motion";
import type { DashboardStats as Stats } from "@/lib/types";

interface DashboardStatsProps {
  stats: Stats;
}

const statCards = [
  { key: "available", label: "Available", color: "text-sky-400", bg: "bg-sky-500/10" },
  { key: "pending", label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "approved", label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "upcoming", label: "Upcoming", color: "text-lavender-400", bg: "bg-lavender-500/10" },
] as const;

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statCards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-glass-border bg-glass-white p-4 backdrop-blur-md"
        >
          <p className="text-sm text-text-secondary">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold ${card.color}`}>
            {stats[card.key]}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
