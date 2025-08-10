"use client";

import dynamic from 'next/dynamic';

const MenuExploreContent = dynamic(() => import('@/components/MenuExploreContent'), {
  ssr: false
});

export default function MenuExplorePage() {
  return <MenuExploreContent />;
}
