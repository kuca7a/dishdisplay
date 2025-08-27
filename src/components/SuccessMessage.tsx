"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
}

export default function SuccessMessage({ message, onClose }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <Card className="fixed bottom-20 right-4 max-w-sm shadow-lg border-2 border-green-200 bg-green-50 z-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="bg-green-500 rounded-full p-1">
            <Trophy className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-green-800">
            {message}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
