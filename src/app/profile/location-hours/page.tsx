"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

// Dynamic import to prevent Auth0 SSR issues
const LocationHoursContent = dynamic(
  () => import("@/components/LocationHoursContent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="lg" />
          <p className="mt-4">Loading Location & Hours...</p>
        </div>
      </div>
    ),
  }
);

export default function LocationHoursPage() {
  return <LocationHoursContent />;
}
