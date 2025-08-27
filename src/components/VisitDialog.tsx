"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Trophy, AlertCircle } from "lucide-react";

interface VisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  restaurantName: string;
  error?: string;
  onClearError?: () => void;
}

export default function VisitDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  restaurantName,
  error,
  onClearError,
}: VisitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Log Restaurant Visit
          </DialogTitle>
          <DialogDescription>
            Track your dining experience at {restaurantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Information */}
          {!error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Earn 10 points for this visit!
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Build your dining achievements by logging restaurant visits
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onClearError?.();
                onOpenChange(false);
              }}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting || !!error}
              className="flex-1 bg-[#5F7161] hover:bg-[#5F7161]/80"
            >
              {isSubmitting ? "Logging..." : "Log Visit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
