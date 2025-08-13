"use client";

import dynamic from 'next/dynamic';

const AccountSettingsContent = dynamic(() => import('@/components/AccountSettingsContent'), {
  ssr: false
});

export default function AccountSettingsPage() {
  return <AccountSettingsContent />;
}
