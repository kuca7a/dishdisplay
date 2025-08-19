"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import DinerGuard from '@/components/DinerGuard';

const DinerProfileContent = dynamic(() => import('@/components/DinerProfileContent'), {
  ssr: false
});

export default function DinerPage() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');

  return (
    <DinerGuard>
      <DinerProfileContent initialRestaurantId={restaurantId} />
    </DinerGuard>
  );
}
