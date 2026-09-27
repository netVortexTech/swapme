"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingSuccessProps {
  open: boolean;
  onClose: () => void;
  date: string | null;
}

export function BookingSuccess({ open, onClose, date }: BookingSuccessProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <span className="text-5xl">{"\u{2728}"}</span>
          </motion.div>
          <DialogTitle className="text-center text-xl">
            Morning captured!
          </DialogTitle>
          <DialogDescription className="text-center">
            {date && (
              <>
                Your request for{" "}
                <span className="font-medium text-text-primary">
                  {format(parseISO(date), "MMMM d")}
                </span>{" "}
                has been sent for approval.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center py-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2">
            <span>{"\u{2601}\u{FE0F}"}</span>
            <span className="text-sm text-amber-400">Waiting for approval...</span>
          </div>
        </motion.div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full">
            Back to the sky
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
