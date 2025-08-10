"use client";

import dynamic from 'next/dynamic';

const ProfileContent = dynamic(() => import('@/components/ProfileContent'), {
  ssr: false
});

export default function Page() {
  return <ProfileContent />;
}
