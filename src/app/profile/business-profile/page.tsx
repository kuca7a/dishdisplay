"use client";

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Auth0
const BusinessProfileContent = dynamic(
  () => import('@/components/BusinessProfileContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading Business Profile...</p>
        </div>
      </div>
    ),
  }
);

export default function BusinessProfilePage() {
  return <BusinessProfileContent />;
}
