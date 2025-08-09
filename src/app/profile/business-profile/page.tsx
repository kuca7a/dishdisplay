"use client";

// Force dynamic rendering to prevent prerender issues with Auth0
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Globe, Mail, Loader2 } from "lucide-react";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function BusinessProfilePage() {
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
    name: "",
    business_type: "",
    description: "",
    phone: "",
    business_email: "",
    website: "",
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
              name: restaurantData.name || "",
              business_type: restaurantData.business_type || "",
              description: restaurantData.description || "",
              phone: restaurantData.phone || "",
              business_email: restaurantData.business_email || "",
              website: restaurantData.website || "",
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
          name: restaurantData.name || "",
          business_type: restaurantData.business_type || "",
          description: restaurantData.description || "",
          phone: restaurantData.phone || "",
          business_email: restaurantData.business_email || "",
          website: restaurantData.website || "",
        });
      }
    } catch (err) {
      console.error("Error loading restaurant data:", err);
      setError("Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear success message when user starts editing
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

      await restaurantService.update(restaurant.id, formData);

      setSuccessMessage("Business profile updated successfully!");

      // Reload data to get the updated info
      await loadRestaurantData();
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setError("Failed to update business profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Simple loading check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Simple auth check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <SidebarInset>
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
                  <BreadcrumbPage>Business Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-orange-600" />
            <h1 className={`${fjallaOne.className} text-3xl text-gray-800`}>
              Business Profile
            </h1>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  <span className="ml-2">Loading restaurant data...</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>
                  Update your restaurant's business profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Restaurant Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your restaurant name"
                      required
                    />
                  </div>

                  {/* Business Type */}
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Input
                      id="business_type"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      placeholder="e.g., Fine Dining, Fast Casual, Cafe"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your restaurant..."
                      rows={4}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Business Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="business_email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Business Email
                    </Label>
                    <Input
                      id="business_email"
                      name="business_email"
                      type="email"
                      value={formData.business_email}
                      onChange={handleInputChange}
                      placeholder="info@yourrestaurant.com"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourrestaurant.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={saving || loading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        "Save Business Profile"
                      )}
                    </Button>
                  </div>
                </form>

                {!restaurant && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      <strong>No restaurant found.</strong> To create your
                      restaurant profile, go to <strong>Menu → Manage</strong>{" "}
                      and add your first restaurant.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
