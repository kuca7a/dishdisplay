"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import to prevent Auth0 SSR issues
const LocationHoursContent = dynamic(() => import('@/components/LocationHoursContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p>Loading Location & Hours...</p>
      </div>
    </div>
  )
});

export default function LocationHoursPage() {
  return <LocationHoursContent />;
}
