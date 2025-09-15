import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Auth0/Google profile images
      "zzfgtqykhummyskdalrj.supabase.co", // Supabase Storage images
      "www.themealdb.com", // TheMealDB images
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.auth0.com *.stripe.com *.vercel-insights.com *.googleapis.com maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: blob: *.supabase.co *.googleusercontent.com *.themealdb.com *.googleapis.com *.gstatic.com maps.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' *.supabase.co *.auth0.com *.stripe.com *.vercel-insights.com *.googleapis.com maps.googleapis.com",
              "frame-src 'self' *.stripe.com *.auth0.com *.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
