"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Fjalla_One } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, TrendingUp, Users, Eye, Clock, Star } from "lucide-react";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function InsightsContent() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F7161]"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className={fjallaOne.className}>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Insights</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart className="h-8 w-8 text-[#5F7161]" />
                <div>
                  <h1 className="text-3xl font-bold">Restaurant Insights</h1>
                  <p className="text-gray-600">
                    Track your menu performance and customer engagement
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Menu Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+12.3%</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      QR Scans
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">892</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+8.7%</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. View Time
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2m 14s</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+5.2%</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Customer Rating
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+0.2</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Analytics */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Menu Performance
                    </CardTitle>
                    <CardDescription>
                      Most popular items this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#5F7161]/5 rounded-lg">
                        <div>
                          <p className="font-medium">Margherita Pizza</p>
                          <p className="text-sm text-gray-600">234 views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600 font-medium">
                            +18%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Caesar Salad</p>
                          <p className="text-sm text-gray-600">198 views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600 font-medium">
                            +12%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Grilled Salmon</p>
                          <p className="text-sm text-gray-600">156 views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600 font-medium">
                            +8%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                      Advanced analytics and reporting features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Advanced Analytics
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get detailed insights into customer behavior, peak
                        hours, and menu optimization recommendations.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Heat Maps</span>
                          <span className="text-xs text-[#5F7161]">
                            Coming Soon
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Customer Journey</span>
                          <span className="text-xs text-[#5F7161]">
                            Coming Soon
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Revenue Analytics</span>
                          <span className="text-xs text-[#5F7161]">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest interactions with your menu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Menu viewed via QR code</p>
                        <p className="text-sm text-gray-600">
                          Table 7 • 2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Pizza Margherita viewed</p>
                        <p className="text-sm text-gray-600">
                          Online • 5 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-[#5F7161] rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Menu shared on social media
                        </p>
                        <p className="text-sm text-gray-600">
                          Instagram • 1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
