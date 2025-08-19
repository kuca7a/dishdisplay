"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    // Redirect to the intended page from appState, or fallback to current page
    const returnTo = appState?.returnTo || window.location.pathname;
    router.push(returnTo);
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
