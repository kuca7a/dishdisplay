import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Auth0/Google profile images
      "zzfgtqykhummyskdalrj.supabase.co" // Supabase Storage images
    ],
  },
  /* config options here */
};

export default nextConfig;
