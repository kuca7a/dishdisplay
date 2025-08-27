"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Calendar, Camera, Target } from "lucide-react";

interface EarnPointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAction: (action: "visit" | "review" | "photo-review") => void;
}

export default function EarnPointsModal({
  open,
  onOpenChange,
  onSelectAction,
}: EarnPointsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#5F7161]" />
            Earn Dining Points
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to earn points at this restaurant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Log Visit */}
          <div
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              onSelectAction("visit");
              onOpenChange(false);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Log Visit</h3>
                  <p className="text-sm text-gray-600">Quick check-in</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">+10 pts</Badge>
            </div>
          </div>

          {/* Write Review */}
          <div
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              onSelectAction("review");
              onOpenChange(false);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium">Write Review</h3>
                  <p className="text-sm text-gray-600">Share your experience</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">+25-40 pts</Badge>
            </div>
          </div>

          {/* Photo Review */}
          <div
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              onSelectAction("photo-review");
              onOpenChange(false);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-medium">Photo Review</h3>
                  <p className="text-sm text-gray-600">
                    Review with photos & detailed text
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Up to 50 pts</Badge>
            </div>
          </div>

          {/* Bonus Opportunities */}
          <div className="pt-2 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Smart Points System
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>• Detailed review (20+ chars)</span>
                <span className="text-green-600">+10 pts</span>
              </div>
              <div className="flex justify-between">
                <span>• Each photo added</span>
                <span className="text-green-600">+5 pts</span>
              </div>
              <div className="flex justify-between">
                <span>• Complete profile</span>
                <span className="text-green-600">+25 pts</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded">
              <strong>Fair Play:</strong> One visit per restaurant per day, one review per restaurant per week. This ensures authentic experiences!
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
