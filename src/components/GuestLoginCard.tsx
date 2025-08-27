"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, LogIn } from "lucide-react";

export default function GuestLoginCard() {
  const pathname = usePathname();

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm shadow-lg border-2 border-[#5F7161]/20 bg-white/95 backdrop-blur z-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-[#5F7161] rounded-full p-2">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Unlock Food Explorer Features!
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Track visits, write reviews, and earn dining achievements
            </p>
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
              <Button
                size="sm"
                className="w-full bg-[#5F7161] hover:bg-[#5F7161]/80 text-white"
              >
                <LogIn className="h-3 w-3 mr-1" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
