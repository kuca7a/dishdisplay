"use client";

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import ReviewsSection from "@/components/ReviewsSection";
import VisitStatsCard from "@/components/VisitStatsCard";
import { restaurantService } from "@/lib/database";
import { analyticsService } from "@/lib/analytics";
import { Restaurant, AnalyticsOverview, MenuPerformanceItem, RecentActivity } from "@/types/database";
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
import { BarChart, TrendingUp, Users, Eye, Clock } from "lucide-react";

import { Rubik } from "next/font/google";

import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function InsightsContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [menuPerformance, setMenuPerformance] = useState<MenuPerformanceItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoadingRestaurant(true);
        if (user?.email) {
          const restaurantData = await restaurantService.getByOwnerEmail(user.email);
          setRestaurant(restaurantData);
        }
      } catch (err) {
        console.error("Error loading restaurant data:", err);
      } finally {
        setLoadingRestaurant(false);
      }
    };

    if (isAuthenticated && user?.email) {
      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!restaurant) return;
      
      try {
        setLoadingAnalytics(true);
        
        // Load analytics data in parallel
        const [analyticsOverview, performance, activity] = await Promise.all([
          analyticsService.getAnalyticsOverview(restaurant.id),
          analyticsService.getMenuPerformance(restaurant.id),
          analyticsService.getRecentActivity(restaurant.id)
        ]);

        setAnalytics(analyticsOverview);
        setMenuPerformance(performance);
        setRecentActivity(activity);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (restaurant && !loadingRestaurant) {
      loadAnalyticsData();
    }
  }, [restaurant, loadingRestaurant]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatChange = (change: number): { text: string; isPositive: boolean } => {
    const isPositive = change >= 0;
    const text = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
    return { text, isPositive };
  };

  const formatActivityTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={rubik.className}>
        <div className={rubik.className}>
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

              {/* Customer Reviews Section */}
              {restaurant && !loadingRestaurant && (
                <ReviewsSection restaurantId={restaurant.id} />
              )}

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
                    {loadingAnalytics ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{analytics?.totalMenuViews.toLocaleString() || '0'}</div>
                        <p className="text-xs text-muted-foreground">
                          {analytics && (
                            <span className={analytics.menuViewsChange >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatChange(analytics.menuViewsChange).text}
                            </span>
                          )} from last month
                        </p>
                      </>
                    )}
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
                    {loadingAnalytics ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{analytics?.totalQrScans.toLocaleString() || '0'}</div>
                        <p className="text-xs text-muted-foreground">
                          {analytics && (
                            <span className={analytics.qrScansChange >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatChange(analytics.qrScansChange).text}
                            </span>
                          )} from last month
                        </p>
                      </>
                    )}
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
                    {loadingAnalytics ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{analytics ? formatTime(analytics.averageViewTimeSeconds) : '0s'}</div>
                        <p className="text-xs text-muted-foreground">
                          {analytics && (
                            <span className={analytics.viewTimeChange >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatChange(analytics.viewTimeChange).text}
                            </span>
                          )} from last month
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Unique Visitors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loadingAnalytics ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{analytics?.uniqueVisitors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          <span className={analytics && analytics.uniqueVisitorsChange >= 0 ? "text-green-600" : "text-red-600"}>
                            {analytics ? formatChange(analytics.uniqueVisitorsChange).text : '+0.0%'}
                          </span>
                          {' '}from last month
                        </p>
                      </>
                    )}
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
                    {loadingAnalytics ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : menuPerformance.length > 0 ? (
                      <div className="space-y-4">
                        {menuPerformance.slice(0, 3).map((item, index) => (
                          <div key={item.menu_item_id} className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0 ? 'bg-[#5F7161]/5' : 'bg-gray-50'
                          }`}>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.total_views} views</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-green-600 font-medium">
                                {item.views_change_percentage > 0 ? '+' : ''}{item.views_change_percentage.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No menu performance data yet</p>
                        <p className="text-sm">Data will appear once your menu receives views</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Visit Statistics Card */}
                {restaurant && !loadingRestaurant && (
                  <VisitStatsCard restaurantId={restaurant.id} />
                )}
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
                  {loadingAnalytics ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => {
                        const getActivityColor = (type: string) => {
                          switch (type) {
                            case 'qr_scan': return 'bg-green-500';
                            case 'menu_view': return 'bg-blue-500';
                            case 'item_view': return 'bg-purple-500';
                            case 'visit_marked': return 'bg-[#5F7161]';
                            case 'review_submitted': return 'bg-yellow-500';
                            default: return 'bg-gray-500';
                          }
                        };

                        return (
                          <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-gray-600">
                                {formatActivityTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Activity will appear when customers interact with your menu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
