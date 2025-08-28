import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Auth0/Google profile images
      "zzfgtqykhummyskdalrj.supabase.co", // Supabase Storage images
      "www.themealdb.com" // TheMealDB images
    ],
  },
  /* config options here */
};

export default nextConfig;
