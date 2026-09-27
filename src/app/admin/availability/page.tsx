"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ParsedSlot } from "@/lib/types";
import { AvailabilityParser } from "@/components/admin/AvailabilityParser";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AvailabilityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleConfirm = async (slots: ParsedSlot[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          router.refresh();
        }, 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Availability</h1>
      <div className="max-w-2xl">
        <AvailabilityParser onConfirm={handleConfirm} />
        {saving && (
          <div className="mt-4 text-sm text-text-secondary">Saving...</div>
        )}
        {saved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
          >
            Availability saved successfully!
          </motion.div>
        )}
      </div>
    </div>
  );
}
