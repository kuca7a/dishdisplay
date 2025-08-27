"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Star, Trophy } from "lucide-react";

interface ActionMenuProps {
  userEmail?: string;
  onLogVisit?: () => void;
  onWriteReview?: () => void;
  onEarnPoints: () => void;
}

export default function ActionMenu({ 
  userEmail, 
  onLogVisit, 
  onWriteReview, 
  onEarnPoints 
}: ActionMenuProps) {
  return (
    <Card className="fixed bottom-4 right-4 shadow-lg border-2 border-[#5F7161]/20 bg-white/95 backdrop-blur z-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[#5F7161] rounded-full p-1">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-700">
            Welcome, {userEmail?.split("@")[0] || "Guest"}!
          </span>
          <Badge
            variant="secondary"
            className="text-xs bg-[#5F7161]/10 text-[#5F7161]"
          >
            Food Explorer
          </Badge>
        </div>

        <div className="space-y-2">
          {onLogVisit && (
            <Button
              onClick={onLogVisit}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs hover:bg-[#5F7161]/5"
            >
              <Calendar className="h-3 w-3 mr-2" />
              Log Visit (+10 points)
            </Button>
          )}

          {onWriteReview && (
            <Button
              onClick={onWriteReview}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs hover:bg-[#5F7161]/5"
            >
              <Star className="h-3 w-3 mr-2" />
              Write Review (+25 points)
            </Button>
          )}

          <Button
            onClick={onEarnPoints}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Trophy className="h-3 w-3 mr-2" />
            More Ways to Earn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
