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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { MapPin, Clock } from "lucide-react";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function LocationHoursContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  // State for restaurant data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    monday_hours: "",
    tuesday_hours: "",
    wednesday_hours: "",
    thursday_hours: "",
    friday_hours: "",
    saturday_hours: "",
    sunday_hours: "",
    timezone: "America/New_York",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const loadRestaurantData = async () => {
        try {
          setLoading(true);
          const restaurantData = await restaurantService.getByOwnerEmail(
            user!.email!
          );

          if (restaurantData) {
            setRestaurant(restaurantData);
            setFormData({
              address: restaurantData.address || "",
              city: restaurantData.city || "",
              state: restaurantData.state || "",
              postal_code: restaurantData.postal_code || "",
              country: restaurantData.country || "",
              monday_hours: restaurantData.monday_hours || "",
              tuesday_hours: restaurantData.tuesday_hours || "",
              wednesday_hours: restaurantData.wednesday_hours || "",
              thursday_hours: restaurantData.thursday_hours || "",
              friday_hours: restaurantData.friday_hours || "",
              saturday_hours: restaurantData.saturday_hours || "",
              sunday_hours: restaurantData.sunday_hours || "",
              timezone: restaurantData.timezone || "America/New_York",
            });
          }
        } catch (err) {
          console.error("Error loading restaurant data:", err);
          setError("Failed to load restaurant data");
        } finally {
          setLoading(false);
        }
      };

      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const restaurantData = await restaurantService.getByOwnerEmail(
        user!.email!
      );

      if (restaurantData) {
        setRestaurant(restaurantData);
        setFormData({
          address: restaurantData.address || "",
          city: restaurantData.city || "",
          state: restaurantData.state || "",
          postal_code: restaurantData.postal_code || "",
          country: restaurantData.country || "",
          monday_hours: restaurantData.monday_hours || "",
          tuesday_hours: restaurantData.tuesday_hours || "",
          wednesday_hours: restaurantData.wednesday_hours || "",
          thursday_hours: restaurantData.thursday_hours || "",
          friday_hours: restaurantData.friday_hours || "",
          saturday_hours: restaurantData.saturday_hours || "",
          sunday_hours: restaurantData.sunday_hours || "",
          timezone: restaurantData.timezone || "America/New_York",
        });
      }
    } catch (err) {
      console.error("Error loading restaurant data:", err);
      setError("Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (successMessage) setSuccessMessage(null);
  };

  const handleHoursChange = (day: string, value: string) => {
    setFormData((prev) => ({ ...prev, [`${day}_hours`]: value }));
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      setError(
        "No restaurant found. Please create a restaurant first in Menu > Manage."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log("Updating restaurant with data:", formData);
      console.log("Restaurant ID:", restaurant.id);

      await restaurantService.update(restaurant.id, formData);

      setSuccessMessage("Location & Hours updated successfully!");

      // Reload data to get the updated info
      await loadRestaurantData();
    } catch (err: unknown) {
      console.error("Error updating restaurant:", err);

      const errorObj = err as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      console.error(
        "Error details:",
        errorObj.message,
        errorObj.details,
        errorObj.hint,
        errorObj.code
      );

      let errorMessage = "Failed to update location & hours. ";

      if (errorObj.code === "PGRST116") {
        errorMessage += "Restaurant not found. Please try again.";
      } else if (errorObj.message?.includes("coerce")) {
        errorMessage +=
          "Database query issue. Please check if there are duplicate restaurants.";
      } else if (
        errorObj.message?.includes("column") &&
        errorObj.message?.includes("does not exist")
      ) {
        errorMessage +=
          "Database schema needs to be updated. Please run the SQL script in Supabase.";
      } else if (errorObj.message) {
        errorMessage += `Details: ${errorObj.message}`;
      } else {
        errorMessage += "Please try again.";
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Simple loading check
  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="lg" color="#5F7161" className="mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Simple auth check
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be authenticated to access this page.</p>
        </div>
      </div>
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
                  <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Location & Hours</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-[#5F7161]" />
            <h1
              className={`${rubik.className} font-semibold text-3xl text-gray-800`}
            >
              Location & Hours
            </h1>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <ThreeDotsLoader size="md" color="#5F7161" className="mr-2" />
                  <span>Loading location data...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {successMessage && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <span>{successMessage}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form */}
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Location Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Details
                    </CardTitle>
                    <CardDescription>
                      Your restaurant&apos;s physical address and location
                      information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="San Francisco"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="CA"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">ZIP Code</Label>
                        <Input
                          id="postal_code"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="94102"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="United States"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Operating Hours
                    </CardTitle>
                    <CardDescription>
                      Set your daily operating hours for customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.key}
                        className="flex items-center justify-between space-x-4"
                      >
                        <div className="w-20 text-sm font-medium">
                          {day.label}
                        </div>
                        <div className="flex items-center space-x-2 flex-1">
                          <Input
                            type="text"
                            value={
                              formData[
                                `${day.key}_hours` as keyof typeof formData
                              ]
                            }
                            onChange={(e) =>
                              handleHoursChange(day.key, e.target.value)
                            }
                            placeholder="e.g. 9:00 AM - 9:00 PM or Closed"
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving || loading}
                  className="bg-[#5F7161] hover:bg-[#4C5B4F] cursor-pointer"
                >
                  {saving ? (
                    <>
                      <ThreeDotsLoader
                        size="sm"
                        color="white"
                        className="mr-2"
                      />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Location & Hours"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>

              {!restaurant && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    <strong>No restaurant found.</strong> To create your
                    restaurant profile, go to <strong>Menu → Manage</strong> and
                    add your first restaurant.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
