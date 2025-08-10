"use client";

import dynamic from 'next/dynamic';

const PreviewContent = dynamic(() => import('@/components/PreviewContent'), {
  ssr: false
});

export default function PreviewPage() {
  return <PreviewContent />;
}
