"use client";

import dynamic from "next/dynamic";
import SmartRedirect from "@/components/SmartRedirect";

const ProfileContent = dynamic(() => import("@/components/ProfileContent"), {
  ssr: false,
});

export default function Page() {
  return (
    <SmartRedirect 
      requireAuth={true}
      allowedUserTypes={['restaurant_owner']}
    >
      <ProfileContent />
    </SmartRedirect>
  );
}
