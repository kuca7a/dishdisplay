"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { restaurantService } from "@/lib/database";
import { Rubik } from "next/font/google";

import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function PreviewContent() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [status, setStatus] = useState<
    "loading" | "opening" | "no-restaurant" | "error"
  >("loading");

  useEffect(() => {
    const redirectToCustomerMenu = async () => {
      if (!isAuthenticated || !user?.email) {
        return;
      }

      try {
        setStatus("loading");

        // Get the user's restaurant
        const restaurant = await restaurantService.getByOwnerEmail(user.email);

        if (restaurant) {
          setStatus("opening");

          // Small delay for better UX
          setTimeout(() => {
            // Open the customer menu in a new window
            const customerMenuUrl = `/menu/${restaurant.id}`;
            window.open(customerMenuUrl, "_blank", "noopener,noreferrer");

            // Go back to the previous page instead of closing
            window.history.back();
          }, 1000);
        } else {
          setStatus("no-restaurant");
        }
      } catch (error) {
        console.error("Error fetching restaurant for preview:", error);
        setStatus("error");
      }
    };

    if (!isLoading && isAuthenticated) {
      redirectToCustomerMenu();
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div
        className={`${rubik.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5F7161]/5 to-gray-50`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="text-lg text-gray-600 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`${rubik.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5F7161]/5 to-gray-50`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to preview your menu.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-[#5F7161] text-white rounded-md hover:bg-[#4C5B4F] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (status === "no-restaurant") {
    return (
      <div
        className={`${rubik.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5F7161]/5 to-gray-50`}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-4">No Restaurant Found</h1>
          <p className="text-gray-600 mb-6">
            Please create a restaurant first before previewing the customer
            menu.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/profile/menu/manage")}
              className="block w-full px-4 py-2 bg-[#5F7161] text-white rounded-md hover:bg-[#4C5B4F] transition-colors"
            >
              Create Restaurant
            </button>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={`${rubik.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5F7161]/5 to-gray-50`}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Preview Error</h1>
          <p className="text-gray-600 mb-6">
            Error loading restaurant preview. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-[#5F7161] text-white rounded-md hover:bg-[#4C5B4F] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rubik.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5F7161]/5 to-gray-50`}
    >
      <div className="text-center">
        <div className="animate-pulse text-6xl mb-4">👀</div>
        <ThreeDotsLoader size="md" />
        <p className="text-lg text-gray-600 mt-4">
          Opening customer menu preview...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          A new window will open shortly
        </p>
      </div>
    </div>
  );
}
