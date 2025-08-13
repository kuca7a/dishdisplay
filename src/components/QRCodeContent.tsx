"use client";

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { Rubik } from "next/font/google";
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
import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";
import { QrCode, PrinterIcon, Smartphone, ArrowRight } from "lucide-react";

import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function QRCodeContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        const restaurantData = await restaurantService.getByOwnerEmail(
          user!.email!
        );
        setRestaurant(restaurantData);
      } catch (err) {
        console.error("Error loading restaurant data:", err);
        setError("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.email) {
      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="lg" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={rubik.className}>
        <div>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>QR Code</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <QrCode className="h-8 w-8 text-[#5F7161]" />
                  <h1 className="text-3xl font-bold">Your Menu QR Code</h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Make it easy for customers to access your menu. Print this QR
                  code on your physical menus, table tents, or display it at
                  your entrance.
                </p>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <ThreeDotsLoader size="lg" />
                    <p className="mt-4">Loading...</p>
                  </div>
                </div>
              )}

              {error && (
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-6 text-center">
                    <div className="text-red-600 mb-4">
                      <QrCode className="h-12 w-12 mx-auto mb-2" />
                      <p>{error}</p>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="hover:cursor-pointer"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!loading && !error && !restaurant && (
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-6 text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Restaurant Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You need to create a restaurant first before generating a
                      QR code.
                    </p>
                    <Button
                      onClick={() => router.push("/profile/menu/manage")}
                      className="hover:cursor-pointer"
                    >
                      Create Restaurant
                    </Button>
                  </CardContent>
                </Card>
              )}

              {restaurant && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* QR Code Display */}
                  <div>
                    <QRCodeDisplay restaurant={restaurant} />
                  </div>

                  {/* Instructions and Tips */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PrinterIcon className="h-5 w-5" />
                          How to Use Your QR Code
                        </CardTitle>
                        <CardDescription>
                          Step-by-step guide to get the most out of your QR code
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#5F7161]/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#5F7161] text-sm font-semibold">
                              1
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              Download Your QR Code
                            </h4>
                            <p className="text-sm text-gray-600">
                              Download as PNG for printing or SVG for
                              high-quality displays
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#5F7161]/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#5F7161] text-sm font-semibold">
                              2
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">Print and Display</h4>
                            <p className="text-sm text-gray-600">
                              Add to your physical menu, table tents, or
                              entrance display
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#5F7161]/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#5F7161] text-sm font-semibold">
                              3
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              Customers Scan & Enjoy
                            </h4>
                            <p className="text-sm text-gray-600">
                              Customers scan with their phone camera to view
                              your menu instantly
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Placement Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-[#5F7161]" />
                          <span>Place at eye level for easy scanning</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-[#5F7161]" />
                          <span>Ensure good lighting around the QR code</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-[#5F7161]" />
                          <span>Add text: "Scan for Digital Menu"</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-[#5F7161]" />
                          <span>
                            Print at least 2cm x 2cm for reliable scanning
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-[#5F7161]" />
                          <span>Test scanning before finalizing placement</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => router.push("/profile/menu/manage")}
                            variant="outline"
                            className="flex-1 hover:cursor-pointer"
                          >
                            Edit Menu
                          </Button>
                          <Button
                            onClick={() =>
                              window.open(`/menu/${restaurant.id}`, "_blank")
                            }
                            className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F] hover:cursor-pointer"
                          >
                            Preview Menu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
