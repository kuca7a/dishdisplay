"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Auth0Provider
      domain="dev-6zaace68fbb1fcji.us.auth0.com"
      clientId="YEVYfVqQU4JWfar4e959VG2iW2jhTwaP"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
    >
      {children}
    </Auth0Provider>
  );
};
