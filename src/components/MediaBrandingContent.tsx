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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Image,
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const themeOptions = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "elegant", label: "Elegant" },
  { value: "casual", label: "Casual" },
  { value: "rustic", label: "Rustic" },
];

const fontOptions = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Roboto", label: "Roboto (Clean)" },
  { value: "Merriweather", label: "Merriweather (Classic)" },
  { value: "Open Sans", label: "Open Sans (Friendly)" },
];

export default function MediaBrandingContent() {
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
    logo_url: "",
    cover_image_url: "",
    primary_color: "#FF6B35",
    secondary_color: "#FFF5F1",
    accent_color: "#2C3E50",
    font_family: "Inter",
    theme_style: "modern",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: "",
    social_tiktok: "",
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
              logo_url: restaurantData.logo_url || "",
              cover_image_url: restaurantData.cover_image_url || "",
              primary_color: restaurantData.primary_color || "#FF6B35",
              secondary_color: restaurantData.secondary_color || "#FFF5F1",
              accent_color: restaurantData.accent_color || "#2C3E50",
              font_family: restaurantData.font_family || "Inter",
              theme_style: restaurantData.theme_style || "modern",
              social_facebook: restaurantData.social_facebook || "",
              social_instagram: restaurantData.social_instagram || "",
              social_twitter: restaurantData.social_twitter || "",
              social_linkedin: restaurantData.social_linkedin || "",
              social_tiktok: restaurantData.social_tiktok || "",
            });
          }
        } catch (err: unknown) {
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
          logo_url: restaurantData.logo_url || "",
          cover_image_url: restaurantData.cover_image_url || "",
          primary_color: restaurantData.primary_color || "#FF6B35",
          secondary_color: restaurantData.secondary_color || "#FFF5F1",
          accent_color: restaurantData.accent_color || "#2C3E50",
          font_family: restaurantData.font_family || "Inter",
          theme_style: restaurantData.theme_style || "modern",
          social_facebook: restaurantData.social_facebook || "",
          social_instagram: restaurantData.social_instagram || "",
          social_twitter: restaurantData.social_twitter || "",
          social_linkedin: restaurantData.social_linkedin || "",
          social_tiktok: restaurantData.social_tiktok || "",
        });
      }
    } catch (err: unknown) {
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

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      setError(
        "No restaurant found. Please create a restaurant first in Business Profile."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log("Updating restaurant with branding data:", formData);
      console.log("Restaurant ID:", restaurant.id);

      await restaurantService.update(restaurant.id, formData);

      setSuccessMessage("Media & Branding updated successfully!");

      // Reload data to get the updated info
      await loadRestaurantData();
    } catch (err: unknown) {
      console.error("Error updating restaurant:", err);

      const errorObj = err as {
        message?: string;
        details?: string;
        hint?: string;
      };
      console.error(
        "Error details:",
        errorObj.message,
        errorObj.details,
        errorObj.hint
      );

      let errorMessage = "Failed to update media & branding. ";

      if (
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
          <ThreeDotsLoader size="md" />
          <p className="mt-4">Loading...</p>
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
                  <BreadcrumbPage>Media & Branding</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-[#5F7161]" />
            <h1
              className={`${rubik.className} font-semibold text-3xl text-gray-800`}
            >
              Media & Branding
            </h1>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <ThreeDotsLoader size="md" />
                  <span className="ml-2">Loading branding data...</span>
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
              <div className="grid gap-6">
                {/* Media Assets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className="h-5 w-5" />
                      Media Assets
                    </CardTitle>
                    <CardDescription>
                      Upload your logo and images (URLs for now - file upload
                      coming soon)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        name="logo_url"
                        type="url"
                        value={formData.logo_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_image_url">Cover Image URL</Label>
                      <Input
                        id="cover_image_url"
                        name="cover_image_url"
                        type="url"
                        value={formData.cover_image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Brand Colors & Theme */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Brand Colors & Theme
                    </CardTitle>
                    <CardDescription>
                      Choose colors and style that represent your restaurant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary_color">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary_color"
                            name="primary_color"
                            type="color"
                            value={formData.primary_color}
                            onChange={handleInputChange}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleInputChange}
                            placeholder="#FF6B35"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary_color">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary_color"
                            name="secondary_color"
                            type="color"
                            value={formData.secondary_color}
                            onChange={handleInputChange}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleInputChange}
                            placeholder="#FFF5F1"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accent_color">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="accent_color"
                            name="accent_color"
                            type="color"
                            value={formData.accent_color}
                            onChange={handleInputChange}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            name="accent_color"
                            value={formData.accent_color}
                            onChange={handleInputChange}
                            placeholder="#2C3E50"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={formData.font_family}
                          onValueChange={(value) =>
                            handleSelectChange("font_family", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Theme Style</Label>
                        <Select
                          value={formData.theme_style}
                          onValueChange={(value) =>
                            handleSelectChange("theme_style", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {themeOptions.map((theme) => (
                              <SelectItem key={theme.value} value={theme.value}>
                                {theme.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription>
                      Connect your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="social_facebook"
                          className="flex items-center gap-2"
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </Label>
                        <Input
                          id="social_facebook"
                          name="social_facebook"
                          value={formData.social_facebook}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/yourrestaurant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="social_instagram"
                          className="flex items-center gap-2"
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </Label>
                        <Input
                          id="social_instagram"
                          name="social_instagram"
                          value={formData.social_instagram}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/yourrestaurant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="social_twitter"
                          className="flex items-center gap-2"
                        >
                          <Twitter className="h-4 w-4" />
                          Twitter / X
                        </Label>
                        <Input
                          id="social_twitter"
                          name="social_twitter"
                          value={formData.social_twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/yourrestaurant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="social_tiktok">TikTok</Label>
                        <Input
                          id="social_tiktok"
                          name="social_tiktok"
                          value={formData.social_tiktok}
                          onChange={handleInputChange}
                          placeholder="https://tiktok.com/@yourrestaurant"
                        />
                      </div>
                    </div>
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
                    <div className="flex items-center">
                      <ThreeDotsLoader size="sm" />
                      <span className="ml-2">Saving Changes...</span>
                    </div>
                  ) : (
                    "Save Media & Branding"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Preview Changes
                </Button>
              </div>

              {!restaurant && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    <strong>No restaurant found.</strong> To create your
                    restaurant profile, go to <strong>Business Profile</strong> and
                    add your restaurant information.
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
