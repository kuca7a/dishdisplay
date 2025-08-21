"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserType } from "@/hooks/use-user-type";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

interface SmartRedirectProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: ('restaurant_owner' | 'diner')[];
  redirectTo?: {
    restaurant_owner?: string;
    diner?: string;
    unauthenticated?: string;
  };
}

export default function SmartRedirect({ 
  children, 
  requireAuth = true,
  allowedUserTypes,
  redirectTo = {
    restaurant_owner: '/profile',
    diner: '/diner',
    unauthenticated: '/'
  }
}: SmartRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth0();
  const { userType, loading: userTypeLoading } = useUserType();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth and user type detection to complete
    if (isLoading || userTypeLoading) return;

    // Handle unauthenticated users
    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo.unauthenticated || '/');
      return;
    }

    // Handle authenticated users with restricted access
    if (isAuthenticated && allowedUserTypes && userType) {
      if (!allowedUserTypes.includes(userType)) {
        // Redirect to their appropriate dashboard
        const destination = userType === 'restaurant_owner' 
          ? (redirectTo.restaurant_owner || '/profile')
          : (redirectTo.diner || '/diner');
        router.replace(destination);
        return;
      }
    }
  }, [isAuthenticated, isLoading, userType, userTypeLoading, requireAuth, allowedUserTypes, redirectTo, router]);

  // Show loading while checking auth and user type
  if (isLoading || userTypeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Check if user type is restricted
  if (isAuthenticated && allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return null;
  }

  return <>{children}</>;
}
