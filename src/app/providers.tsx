"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const onRedirectCallback = (appState?: { returnTo?: string; userType?: string }) => {
    // Handle user type routing
    if (appState?.userType === 'restaurant_owner') {
      router.push('/profile');
    } else if (appState?.userType === 'diner') {
      // Return to the menu they were viewing or diner dashboard
      const returnTo = appState.returnTo || '/diner';
      router.push(returnTo);
    } else {
      // Fallback - if no user type specified, go to login page to choose
      const returnTo = appState?.returnTo;
      if (returnTo && (returnTo !== '/login' && returnTo !== '/')) {
        router.push('/login');
      } else {
        router.push(returnTo || '/');
      }
    }
  };

  return (
    <Auth0Provider
      domain="dev-6zaace68fbb1fcji.us.auth0.com"
      clientId="YEVYfVqQU4JWfar4e959VG2iW2jhTwaP"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
