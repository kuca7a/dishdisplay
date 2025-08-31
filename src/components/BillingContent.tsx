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
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Zap,
} from "lucide-react";
import { restaurantService } from "@/lib/database";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { Restaurant } from "@/types/database";
import { loadStripe } from "@stripe/stripe-js";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BillingContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!isAuthenticated || !user?.email) return;

      try {
        setLoading(true);
        const restaurantData = await restaurantService.getByOwnerEmail(
          user.email
        );
        setRestaurant(restaurantData);
      } catch (err) {
        console.error("Error loading restaurant data:", err);
        setError("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [isAuthenticated, user]);

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "trialing":
        return <Zap className="h-4 w-4" />;
      case "past_due":
        return <AlertTriangle className="h-4 w-4" />;
      case "canceled":
      case "unpaid":
        return <XCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!restaurant) return;

    try {
      setActionLoading("upgrade");

      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const { clientSecret, error } = await response.json();

      if (error) throw new Error(error);

      if (clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) throw new Error(error.message);
      }

      // Refresh restaurant data
      const updatedRestaurant = await restaurantService.getByOwnerEmail(
        user!.email!
      );
      setRestaurant(updatedRestaurant);
    } catch (err) {
      console.error("Upgrade error:", err);
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (!restaurant?.stripe_customer_id) return;

    try {
      setActionLoading("portal");

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: restaurant.stripe_customer_id,
          returnUrl: window.location.href,
        }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);

      window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || !isAuthenticated || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="mt-4">Loading Billing...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center h-screen">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>No Restaurant Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Please create your restaurant first in Business Profile.</p>
                <Button onClick={() => router.push("/profile/business")}>
                  Create Restaurant
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const isFreePlan =
    !restaurant.subscription_status ||
    restaurant.subscription_status === "inactive" ||
    restaurant.subscription_plan === "free";
  const hasActiveSub =
    restaurant.subscription_status === "active" ||
    restaurant.subscription_status === "trialing";

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
                  <BreadcrumbPage>Billing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="h-8 w-8 text-[#5F7161]" />
                <h1 className="text-3xl font-bold">Billing & Subscription</h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Manage your subscription, view billing history, and upgrade your
                plan.
              </p>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Plan</span>
                  <Badge
                    className={getSubscriptionStatusColor(
                      restaurant.subscription_status
                    )}
                  >
                    {getSubscriptionStatusIcon(restaurant.subscription_status)}
                    <span className="ml-1 capitalize">
                      {restaurant.subscription_status || "inactive"}
                    </span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your current subscription details and usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium capitalize flex items-center gap-1">
                          {restaurant.subscription_plan === "pro" && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {restaurant.subscription_plan || "Free"}
                        </span>
                      </div>
                      {restaurant.subscription_start_date && (
                        <div className="flex justify-between">
                          <span>Started:</span>
                          <span>
                            {new Date(
                              restaurant.subscription_start_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {restaurant.subscription_end_date && (
                        <div className="flex justify-between">
                          <span>Next billing:</span>
                          <span>
                            {new Date(
                              restaurant.subscription_end_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {restaurant.trial_end_date && (
                        <div className="flex justify-between">
                          <span>Trial ends:</span>
                          <span>
                            {new Date(
                              restaurant.trial_end_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Plan Features</h4>
                    <div className="space-y-1 text-sm">
                      {isFreePlan ? (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Up to 10 menu items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>1 QR code</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-gray-400" />
                            <span>Advanced analytics</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Unlimited menu items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Unlimited QR codes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Advanced analytics</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Custom branding</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  {isFreePlan ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleUpgrade(
                            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY!
                          )
                        }
                        disabled={actionLoading === "upgrade"}
                        className="bg-[#5F7161] hover:bg-[#4C5B4F]"
                      >
                        {actionLoading === "upgrade" ? (
                          <div className="flex items-center">
                            <ThreeDotsLoader size="sm" />
                            <span className="ml-2">Upgrading...</span>
                          </div>
                        ) : (
                          "Upgrade to Pro Monthly (£29/month)"
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpgrade(
                            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY!
                          )
                        }
                        disabled={actionLoading === "upgrade"}
                        variant="outline"
                      >
                        {actionLoading === "upgrade" ? (
                          <div className="flex items-center">
                            <ThreeDotsLoader size="sm" />
                            <span className="ml-2">Upgrading...</span>
                          </div>
                        ) : (
                          "Pro Yearly (£299/year - Save 14%)"
                        )}
                      </Button>
                    </div>
                  ) : (
                    hasActiveSub && (
                      <Button
                        onClick={handleManageBilling}
                        disabled={actionLoading === "portal"}
                        variant="outline"
                      >
                        {actionLoading === "portal" ? (
                          <div className="flex items-center">
                            <ThreeDotsLoader size="sm" />
                            <span className="ml-2">Opening...</span>
                          </div>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Manage Billing
                          </>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Comparison */}
            {isFreePlan && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Free Plan</CardTitle>
                    <CardDescription>
                      Perfect for getting started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">£0/month</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to 10 menu items
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />1 QR
                        code
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Basic menu display
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-[#5F7161]/20 bg-gradient-to-b from-[#5F7161]/5 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Pro Plan
                    </CardTitle>
                    <CardDescription>
                      Everything you need to grow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      £29/month
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        or £299/year
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Unlimited menu items
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Unlimited QR codes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Custom branding
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Priority support
                      </li>
                    </ul>
                    <Badge className="bg-blue-100 text-blue-800">
                      14-day free trial
                    </Badge>
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
