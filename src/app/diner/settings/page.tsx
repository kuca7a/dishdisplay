"use client";

import dynamic from "next/dynamic";
import SmartRedirect from "@/components/SmartRedirect";

const DinerAccountSettingsContent = dynamic(
  () => import("@/components/DinerAccountSettingsContent"),
  {
    ssr: false,
  }
);

export default function DinerSettingsPage() {
  return (
    <SmartRedirect 
      requireAuth={true}
      allowedUserTypes={['diner']}
    >
      <DinerAccountSettingsContent />
    </SmartRedirect>
  );
}
