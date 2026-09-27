"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import type { AvailabilitySlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingDialogProps {
  slot: AvailabilitySlot | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingDialog({ slot, open, onClose, onSuccess }: BookingDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooLate, setTooLate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;

    setLoading(true);
    setError(null);
    setTooLate(false);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slot.id,
          employee_name: name,
          employee_email: email,
          message: message || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "slot_taken") {
          setTooLate(true);
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setMessage("");
    setError(null);
    setTooLate(false);
    onClose();
  };

  if (!slot) return null;

  const date = parseISO(slot.date);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {tooLate ? (
            <motion.div
              key="too-late"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <span className="text-5xl mb-4">{"\u{1FAD7}"}</span>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Too late!
              </h3>
              <p className="text-text-secondary mb-6">
                Someone just caught this morning before you {"\u{1F604}"}
              </p>
              <Button onClick={handleClose} variant="outline">
                Back to the sky
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 text-2xl mb-2">
                  <span>{"\u{1F305}"}</span>
                  <DialogTitle>You found a morning.</DialogTitle>
                </div>
                <DialogDescription>
                  {format(date, "EEEE, MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-text-primary">
                    Tell me who you are
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-text-primary">
                    Your email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-text-primary">
                    Anything you'd like me to know?{" "}
                    <span className="text-text-muted">(optional)</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Would love to catch up about..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    variant="sunrise"
                    size="lg"
                    disabled={loading || !name || !email}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Catching...
                      </>
                    ) : (
                      "Catch this morning"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
