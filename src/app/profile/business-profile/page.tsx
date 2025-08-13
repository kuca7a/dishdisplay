"use client";

import dynamic from "next/dynamic";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

// Dynamic import to prevent SSR issues with Auth0
const BusinessProfileContent = dynamic(
  () => import("@/components/BusinessProfileContent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="lg" />
          <p className="mt-4">Loading Business Profile...</p>
        </div>
      </div>
    ),
  }
);

export default function BusinessProfilePage() {
  return <BusinessProfileContent />;
}
