"use client";

import { useEffect } from "react";
import { initializeStorageBucket } from "@/lib/storage";

export function StorageInitializer() {
  useEffect(() => {
    const initStorage = async () => {
      try {
        const result = await initializeStorageBucket();
        if (result.success) {
          console.log("Storage bucket initialized successfully");
        } else {
          console.warn("Storage bucket initialization failed:", result.error);
        }
      } catch (error) {
        console.error("Storage initialization error:", error);
      }
    };

    initStorage();
  }, []);

  return null; // This component doesn't render anything
}
