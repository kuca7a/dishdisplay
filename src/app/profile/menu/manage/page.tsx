"use client";

import dynamic from 'next/dynamic';

const MenuManageContent = dynamic(() => import('@/components/MenuManageContent'), {
  ssr: false
});

export default function MenuManagePage() {
  return <MenuManageContent />;
}
