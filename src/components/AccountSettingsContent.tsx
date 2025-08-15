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
import { AlertTriangle, Settings, Trash2, User, Shield } from "lucide-react";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";

import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function AccountSettingsContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!isAuthenticated || !user?.email) return;

      try {
        const restaurantData = await restaurantService.getByOwnerEmail(
          user.email
        );
        setRestaurant(restaurantData);
      } catch (err) {
        console.error("Error loading restaurant data:", err);
      }
    };

    if (isAuthenticated && user?.email) {
      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

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
                  <BreadcrumbPage>Account Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-[#5F7161]" />
            <h1
              className={`${rubik.className} font-semibold text-3xl text-gray-800`}
            >
              Account Settings
            </h1>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and authentication information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-sm">
                    {user?.name || user?.nickname || "Not provided"}
                  </p>
                </div>
                {restaurant && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Restaurant
                    </label>
                    <p className="text-sm">{restaurant.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">
                      Managed through Auth0 authentication
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Auth0 change password flow would go here
                      window.open(
                        "https://auth0.com/docs/connections/database/password-change",
                        "_blank"
                      );
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 mb-1">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 mb-3">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <ul className="text-xs text-red-600 space-y-1 mb-4">
                      <li>• All restaurant data will be permanently deleted</li>
                      <li>• Menu items and images will be removed</li>
                      <li>• QR codes will stop working immediately</li>
                      <li>• Analytics and insights will be lost</li>
                      {restaurant && (
                        <li>
                          • Restaurant "{restaurant.name}" will be deleted
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!restaurant}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                {!restaurant && (
                  <p className="text-xs text-gray-500 mt-2">
                    Create a restaurant first to enable account deletion
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          restaurant={restaurant}
          user={user || null}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
