"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Check, AlertTriangle } from "lucide-react";
import type { ParseResult, ParsedSlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AvailabilityParserProps {
  onConfirm: (slots: ParsedSlot[]) => void;
}

export function AvailabilityParser({ onConfirm }: AvailabilityParserProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clarifying, setClarifying] = useState<{
    raw: string;
    options: string[];
  } | null>(null);

  const handleParse = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setClarifying(null);

    try {
      const res = await fetch("/api/admin/parse-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to parse schedule");
        return;
      }

      setResult(data.result);

      // Check for uncertain items
      if (data.result.uncertain_items?.length > 0) {
        setClarifying({
          raw: data.result.uncertain_items[0].raw,
          options: data.result.uncertain_items[0].possible_dates,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClarify = (date: string) => {
    if (!result) return;

    // Replace the uncertain item with the chosen date
    const newSlots = [...result.slots];
    // Find the first uncertain item and add the chosen date
    const uncertain = result.uncertain_items[0];
    if (uncertain) {
      newSlots.push({
        date,
        period: "morning",
      });
    }

    setResult({
      ...result,
      slots: newSlots,
      uncertain_items: result.uncertain_items.slice(1),
    });

    // Check if there are more uncertain items
    if (result.uncertain_items.length > 1) {
      setClarifying({
        raw: result.uncertain_items[1].raw,
        options: result.uncertain_items[1].possible_dates,
      });
    } else {
      setClarifying(null);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onConfirm(result.slots);
    setResult(null);
    setInput("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">
          Describe your availability
        </label>
        <Textarea
          placeholder='e.g. "For October I have mornings on the 1st, 3rd, 7th, 10th, 14th and 21st."'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="min-h-[100px]"
        />
        <Button
          onClick={handleParse}
          disabled={loading || !input.trim()}
          variant="sunrise"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Understanding...
            </>
          ) : (
            <>
              <Sparkles />
              Understand my schedule
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Clarification */}
      <AnimatePresence>
        {clarifying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">I need clarification</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              &quot;{clarifying.raw}&quot; could mean:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {clarifying.options.map((date) => (
                <Button
                  key={date}
                  size="sm"
                  variant="outline"
                  onClick={() => handleClarify(date)}
                >
                  {date}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-text-primary">I understood:</h3>
            <div className="flex flex-wrap gap-2">
              {result.slots.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400"
                >
                  <Check className="h-3.5 w-3.5" />
                  {slot.date}
                </div>
              ))}
            </div>

            {result.uncertain_items.length > 0 && !clarifying && (
              <p className="text-sm text-amber-400">
                {result.uncertain_items.length} item(s) need clarification
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleConfirm}
                variant="sunrise"
                disabled={result.slots.length === 0}
              >
                Confirm availability
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setInput("");
                }}
              >
                Start over
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
