"use client";

import dynamic from 'next/dynamic';

const QRCodeContent = dynamic(() => import('@/components/QRCodeContent'), {
  ssr: false
});

export default function QRCodePage() {
  return <QRCodeContent />;
}
