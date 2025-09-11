"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhotoIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { useRestaurantData } from "@/hooks/use-cached-data";
import OnboardingControl from "@/components/OnboardingControl";

import { Rubik } from "next/font/google";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

interface TaskStatus {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: "high" | "medium" | "low";
}

export default function ProfileContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  // Use cached data hook instead of manual state management
  const { restaurant, menuItems, loading } = useRestaurantData();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Greeting logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Calculate task completion status
  const tasks = useMemo((): TaskStatus[] => {
    if (!restaurant) {
      return [
        {
          id: "create-restaurant",
          title: "Create Your Restaurant Profile",
          description: "Set up your restaurant to get started",
          completed: false,
          href: "/profile/business-profile",
          icon: BuildingOfficeIcon,
          priority: "high",
        },
      ];
    }

    const hasBasicInfo = !!(restaurant.name && restaurant.description);
    const hasContactInfo = !!(restaurant.phone || restaurant.business_email);
    const hasLocation = !!(restaurant.address && restaurant.city);
    const hasHours = !!(
      restaurant.monday_hours ||
      restaurant.tuesday_hours ||
      restaurant.wednesday_hours
    );
    const hasBranding = !!(restaurant.logo_url || restaurant.primary_color);
    const hasMenuItems = menuItems.length > 0;
    const hasMenuImages = menuItems.some((item) => item.image_url);
    const menuItemsWithoutImages = menuItems.filter((item) => !item.image_url);
    const allMenuItemsHaveImages =
      hasMenuItems && menuItems.every((item) => item.image_url);

    return [
      {
        id: "business-profile",
        title: "Complete Business Profile",
        description:
          hasBasicInfo && hasContactInfo
            ? "Business profile completed"
            : "Add your restaurant details and contact information",
        completed: hasBasicInfo && hasContactInfo,
        href: "/profile/business-profile",
        icon: BuildingOfficeIcon,
        priority: "high",
      },
      {
        id: "location-hours",
        title: "Set Location & Hours",
        description:
          hasLocation && hasHours
            ? "Location and hours set"
            : "Add your address and operating hours",
        completed: hasLocation && hasHours,
        href: "/profile/location-hours",
        icon: MapPinIcon,
        priority: "high",
      },
      {
        id: "menu-items",
        title: "Add Menu Items",
        description: hasMenuItems
          ? `${menuItems.length} menu items added`
          : "Upload your menu items",
        completed: hasMenuItems,
        href: "/profile/menu",
        icon: DocumentTextIcon,
        priority: "high",
      },
      {
        id: "media-branding",
        title: "Customize Branding",
        description: hasBranding
          ? "Branding customized"
          : "Add your logo and choose brand colors",
        completed: hasBranding,
        href: "/profile/media-branding",
        icon: PhotoIcon,
        priority: "medium",
      },
      {
        id: "menu-images",
        title: "Add Menu Photos",
        description: hasMenuImages
          ? allMenuItemsHaveImages
            ? "All menu items have photos"
            : `${menuItemsWithoutImages.length} items need photos`
          : "Upload photos for your menu items",
        completed: allMenuItemsHaveImages,
        href: "/profile/menu/manage",
        icon: PhotoIcon,
        priority: "medium",
      },
      {
        id: "qr-code",
        title: "Download QR Code",
        description: "Get your QR code for customers to scan",
        completed: false, // Always show as available task
        href: "/profile/qr-code",
        icon: QrCodeIcon,
        priority: "low",
      },
    ];
  }, [restaurant, menuItems]);

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completionPercentage = Math.round(
    (completedTasks.length / tasks.length) * 100
  );

  // Suggestions for completed users
  const suggestions = useMemo(() => {
    if (incompleteTasks.length > 0) return [];

    return [
      {
        title: "Review Your Menu",
        description: "Preview how your menu looks to customers",
        href: "/profile/preview",
        icon: DocumentTextIcon,
      },
      {
        title: "Check New Insights",
        description: "View analytics and performance data",
        href: "/profile/insights",
        icon: ChartBarIcon,
      },
      {
        title: "Update Menu Items",
        description: "Add new dishes or modify existing ones",
        href: "/profile/menu",
        icon: DocumentTextIcon,
      },
      {
        title: "Download QR Code",
        description: "Get your QR code for table displays",
        href: "/profile/qr-code",
        icon: QrCodeIcon,
      },
      {
        title: "Manage Subscription",
        description: "View billing and upgrade options",
        href: "/profile/subscription",
        icon: BuildingOfficeIcon,
      },
    ];
  }, [incompleteTasks.length]);

  if (isLoading || loading || !isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <ThreeDotsLoader size="md" />
              <p className="mt-4">Loading Profile...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={rubik.className}>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/profile">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-8 w-8 text-[#5F7161]" />
            <h1
              className={`${rubik.className} text-3xl text-gray-800 font-medium`}
            >
              Dashboard
            </h1>
          </div>

          <div className="space-y-4">
            {/* Greeting */}
            <Card data-onboarding="welcome">
              <CardContent className="pt-6">
                <span className="text-xl font-semibold">
                  {greeting}
                  {user?.name ? `, ${user.name}` : "!"}
                </span>
              </CardContent>
            </Card>
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Completion</span>
                  <span className="text-[#5F7161]">
                    {completionPercentage}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={completionPercentage} className="mb-4" />
                <p className="text-sm text-gray-600">
                  {completedTasks.length} of {tasks.length} tasks completed
                  {restaurant?.name && ` for ${restaurant.name}`}
                </p>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            {incompleteTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-[#5F7161]" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <task.icon className="h-6 w-6 text-gray-400" />
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                          {task.priority === "high" && (
                            <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-1">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={task.href}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#5F7161] text-[#5F7161] hover:bg-[#5F7161] hover:text-white cursor-pointer"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircleSolidIcon className="h-5 w-5 text-green-600" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-3 bg-green-50 rounded-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">
                          {task.title}
                        </h3>
                        <p className="text-sm text-green-700">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Special section for menu items without images */}
                  {restaurant &&
                    menuItems.length > 0 &&
                    (() => {
                      const menuItemsWithoutImages = menuItems.filter(
                        (item) => !item.image_url
                      );
                      const allMenuItemsHaveImages = menuItems.every(
                        (item) => item.image_url
                      );

                      if (
                        !allMenuItemsHaveImages &&
                        menuItemsWithoutImages.length > 0
                      ) {
                        return (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <PhotoIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-amber-800 mb-2">
                                  Add Photos to Complete Your Menu
                                </h4>
                                <p className="text-sm text-amber-700 mb-3">
                                  {menuItemsWithoutImages.length} menu{" "}
                                  {menuItemsWithoutImages.length === 1
                                    ? "item needs a photo"
                                    : "items need photos"}
                                  :
                                </p>
                                <div className="space-y-1 mb-3">
                                  {menuItemsWithoutImages
                                    .slice(0, 3)
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="text-sm text-amber-700"
                                      >
                                        • {item.name}
                                      </div>
                                    ))}
                                  {menuItemsWithoutImages.length > 3 && (
                                    <div className="text-sm text-amber-700">
                                      • ... and{" "}
                                      {menuItemsWithoutImages.length - 3} more
                                    </div>
                                  )}
                                </div>
                                <Link href="/profile/menu/manage">
                                  <Button
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                                  >
                                    Add Photos Now
                                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🎉 Great Job! What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Excellent work! Your restaurant profile is complete and
                    ready for customers. Here are some ways to continue
                    improving your presence:
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <Link key={index} href={suggestion.href}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <suggestion.icon className="h-6 w-6 text-[#5F7161]" />
                          <div>
                            <h3 className="font-semibold">
                              {suggestion.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Pro tip:</strong> Keep your menu updated
                      regularly and consider adding seasonal items to keep
                      customers engaged!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Onboarding Control */}
            <OnboardingControl />

            {/* Quick Stats */}
            {restaurant && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Menu Items</p>
                        <p className="text-2xl font-bold text-[#5F7161]">
                          {menuItems.length}
                        </p>
                      </div>
                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">With Photos</p>
                        <p className="text-2xl font-bold text-[#5F7161]">
                          {menuItems.filter((item) => item.image_url).length}
                        </p>
                      </div>
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Available Items</p>
                        <p className="text-2xl font-bold text-[#5F7161]">
                          {menuItems.filter((item) => item.is_available).length}
                        </p>
                      </div>
                      <CheckCircleIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
