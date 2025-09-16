"use client";

import React, { useState } from "react";
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
import { useSubscription } from "@/hooks/use-subscription";
import { PaymentSuccessModal } from "@/components/PaymentSuccessModal";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  Receipt,
  Clock,
} from "lucide-react";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function SubscriptionContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();
  const { subscription, openBillingPortal, refetch } = useSubscription();
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle Stripe success/cancel redirects
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get("success");
      const canceled = urlParams.get("canceled");

      if (success === "true" && user?.email) {
        // Payment successful - sync subscription data from Stripe with retries
        const syncSubscription = async (retries = 3) => {
          try {
            const response = await fetch("/api/stripe/sync-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userEmail: user.email }),
            });

            if (response.ok) {
              await refetch(); // Refresh local subscription data
              setShowSuccessModal(true); // Show success modal instead of alert
            } else {
              console.error("Failed to sync subscription");
              if (retries > 0) {
                console.log(
                  `Retrying sync in 2 seconds... (${retries} retries left)`
                );
                setTimeout(() => syncSubscription(retries - 1), 2000);
              } else {
                setShowSuccessModal(true); // Still show success since payment succeeded
              }
            }
          } catch (error) {
            console.error("Sync error:", error);
            if (retries > 0) {
              console.log(
                `Retrying sync in 2 seconds... (${retries} retries left)`
              );
              setTimeout(() => syncSubscription(retries - 1), 2000);
            } else {
              setShowSuccessModal(true); // Still show success since payment succeeded
            }
          }

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        };

        // Initial sync after a longer delay to allow Stripe to process
        setTimeout(syncSubscription, 3000);
      } else if (canceled === "true") {
        // Payment was canceled - just clean up URL, no need to alert
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [refetch, user?.email]);

  const handleUpgrade = async (priceId: string) => {
    try {
      setActionLoading(true);
      console.log("Starting upgrade with priceId:", priceId);
      console.log("User email:", user?.email);

      // Create Stripe Checkout session instead of direct subscription
      const baseUrl = window.location.origin; // Use current origin (should be localhost:3001)
      const response = await fetch(
        `${baseUrl}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user?.email,
            priceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Upgrade error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to start upgrade process: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);

      if (!subscription.customerId) {
        alert(
          "You need to upgrade to a paid plan first to access billing management."
        );
        return;
      }

      await openBillingPortal();
    } catch (error) {
      console.error("Billing portal error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // More user-friendly error message
      alert(
        `Unable to open billing portal: ${errorMessage}. Please contact support if this continues.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
        label: "Active",
      },
      trialing: {
        variant: "secondary" as const,
        icon: Calendar,
        color: "text-blue-600",
        label: "Trial",
      },
      incomplete: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
        label: "Processing",
      },
      incomplete_expired: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        label: "Payment Failed",
      },
      past_due: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        label: "Past Due",
      },
      canceled: {
        variant: "outline" as const,
        icon: XCircle,
        color: "text-gray-600",
        label: "Cancelled",
      },
      unpaid: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        label: "Unpaid",
      },
      inactive: {
        variant: "outline" as const,
        icon: XCircle,
        color: "text-gray-600",
        label: "Inactive",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    const StatusIcon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <StatusIcon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" className="mb-4" />
          <p>Loading...</p>
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
                  <BreadcrumbPage>Subscription</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <PaymentSuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Subscription Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage your Dish Display subscription and billing settings
                </p>
              </div>
              {subscription.plan === "pro" && (
                <Crown className="h-8 w-8 text-yellow-500" />
              )}
            </div>

            {subscription.loading ? (
              <div className="flex items-center justify-center py-12">
                <ThreeDotsLoader size="md" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Your current subscription details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold capitalize">
                        {subscription.plan === "pro"
                          ? "Dish Display Pro"
                          : "Free Plan"}
                      </span>
                      {getStatusBadge(subscription.status)}
                    </div>

                    {subscription.trialEnd &&
                      new Date(subscription.trialEnd) > new Date() && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-700 text-sm">
                            <strong>Trial ends:</strong>{" "}
                            {formatDate(subscription.trialEnd)}
                          </p>
                        </div>
                      )}

                    <div className="space-y-2 text-sm text-gray-600">
                      {subscription.subscriptionEnd && (
                        <div className="flex justify-between">
                          <span>Next billing date:</span>
                          <span>
                            {formatDate(subscription.subscriptionEnd)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Actions
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription.plan === "free" ? (
                      <div className="space-y-3">
                        <Button
                          onClick={() =>
                            handleUpgrade("price_1Rxm3YAluVLbiFnm7JdALoqk")
                          }
                          disabled={actionLoading}
                          className="w-full bg-[#5F7161] hover:bg-[#4C5B4F] cursor-pointer"
                        >
                          {actionLoading ? (
                            <>
                              <ThreeDotsLoader
                                size="sm"
                                color="white"
                                className="mr-2"
                              />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Crown className="h-4 w-4 mr-2" />
                              Upgrade to Pro
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          14-day free trial • Cancel anytime
                        </p>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 text-center">
                            <strong>Monthly:</strong> £29/month
                          </p>
                          <p className="text-sm text-gray-700 text-center">
                            <strong>Annual:</strong> £299/year <span className="text-green-600 font-medium">(Save 14%)</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={handleManageBilling}
                          disabled={actionLoading || !subscription.customerId}
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          {actionLoading ? (
                            <>
                              <ThreeDotsLoader size="sm" className="mr-2" />
                              Opening...
                            </>
                          ) : (
                            <>
                              <Receipt className="h-4 w-4 mr-2" />
                              Manage Billing
                            </>
                          )}
                        </Button>

                        {/* Test Upgrade to Yearly */}
                        <Button
                          onClick={() =>
                            handleUpgrade("price_1Rxm3ZAluVLbiFnmnukwPAOa")
                          }
                          disabled={actionLoading}
                          variant="secondary"
                          className="w-full cursor-pointer"
                        >
                          {actionLoading ? (
                            <>
                              <ThreeDotsLoader size="sm" className="mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Crown className="h-4 w-4 mr-2" />
                              Test Upgrade to Yearly
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Plan Features Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  Compare what's available on each plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Free Plan</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Up to 10 menu items
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />1 QR
                        code
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Basic menu display
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Custom branding
                      </li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Pro Plan
                      <Crown className="h-5 w-5 text-yellow-500" />
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited menu items
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited QR codes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Custom branding
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
