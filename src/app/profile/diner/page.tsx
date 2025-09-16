"use client";

import dynamic from "next/dynamic";
import SmartRedirect from "@/components/SmartRedirect";

const DinerProfileContent = dynamic(
  () => import("@/components/DinerProfileContent"),
  {
    ssr: false,
  }
);

export default function DinerProfilePage() {
  return (
    <SmartRedirect 
      requireAuth={true}
      allowedUserTypes={['diner']}
    >
      <DinerProfileContent />
    </SmartRedirect>
  );
}
