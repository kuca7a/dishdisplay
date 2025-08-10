"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import to prevent Auth0 SSR issues
const FeedbackContent = dynamic(() => import('@/components/FeedbackContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p>Loading Feedback...</p>
      </div>
    </div>
  )
});

export default function FeedbackPage() {
  return <FeedbackContent />;
}
