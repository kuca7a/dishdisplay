"use client";

import dynamic from "next/dynamic";

const DinerProfileContent = dynamic(
  () => import("@/components/DinerProfileContent"),
  {
    ssr: false,
  }
);

export default function DinerProfilePage() {
  return <DinerProfileContent />;
}
