"use client";

import dynamic from 'next/dynamic';
import DinerGuard from '@/components/DinerGuard';

const DinerProfileContent = dynamic(() => import('@/components/DinerProfileContent'), {
  ssr: false
});

export default function DinerPage() {
  return (
    <DinerGuard>
      <DinerProfileContent />
    </DinerGuard>
  );
}
