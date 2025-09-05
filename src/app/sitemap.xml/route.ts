import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dishdisplay.com";

  try {
    const supabase = getSupabaseClient();

    // Static pages
    const staticPages: {
      url: string;
      priority: number;
      changefreq: string;
      lastmod?: string;
    }[] = [
      { url: "", priority: 1.0, changefreq: "daily" },
      { url: "/login", priority: 0.8, changefreq: "monthly" },
      { url: "/about", priority: 0.6, changefreq: "monthly" },
      { url: "/contact", priority: 0.6, changefreq: "monthly" },
      { url: "/privacy", priority: 0.3, changefreq: "yearly" },
      { url: "/terms", priority: 0.3, changefreq: "yearly" },
      { url: "/licensing", priority: 0.3, changefreq: "yearly" },
    ];

    let dynamicPages: {
      url: string;
      priority: number;
      changefreq: string;
      lastmod?: string;
    }[] = [];

    if (supabase) {
      try {
        // Get public restaurants for sitemap
        const { data: restaurants } = await supabase
          .from("restaurants")
          .select("id, updated_at")
          .limit(1000); // Limit for sitemap size

        if (restaurants) {
          dynamicPages = restaurants.map((restaurant) => ({
            url: `/menu/${restaurant.id}`,
            priority: 0.9,
            changefreq: "weekly",
            lastmod: new Date(restaurant.updated_at)
              .toISOString()
              .split("T")[0],
          }));
        }
      } catch (error) {
        console.error("Error fetching restaurants for sitemap:", error);
      }
    }

    const allPages = [...staticPages, ...dynamicPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
