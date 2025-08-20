"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone, Star, MapPin, Clock, Users } from "lucide-react";
import { Notable } from "next/font/google";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function DinerLandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const handleDinerLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: `/diner?restaurant=${restaurantId}`,
      },
    });
  };

  const handleViewMenuOnly = () => {
    router.push(`/menu/${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5F7161]/5 via-white to-[#5F7161]/10">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1
              className={`text-2xl font-semibold text-[#5F7161] ${notable.className}`}
            >
              DISH DISPLAY
            </h1>
            <Badge
              variant="outline"
              className="bg-[#5F7161]/10 text-[#5F7161] border-[#5F7161]/30"
            >
              <QrCode className="h-3 w-3 mr-1" />
              Scanned Menu
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-[#5F7161] rounded-full p-3">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome, Food Explorer!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              You've discovered a digital menu! Choose how you'd like to explore
              this restaurant's offerings.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Create Diner Profile Card */}
            <Card className="border-2 border-[#5F7161]/20 hover:border-[#5F7161]/40 transition-colors hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="bg-[#5F7161] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#5F7161]">
                  Join as Food Explorer
                </CardTitle>
                <CardDescription className="text-base">
                  Track your visits, write reviews, and unlock dining
                  achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#5F7161]" />
                    <span>Track visits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#5F7161]" />
                    <span>Write reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#5F7161]" />
                    <span>Earn badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#5F7161]" />
                    <span>Track favorites</span>
                  </div>
                </div>
                <Button
                  onClick={handleDinerLogin}
                  className="w-full bg-[#5F7161] hover:bg-[#4C5B4F] text-white font-semibold py-3"
                >
                  {isAuthenticated ? "Access Diner Profile" : "Sign Up / Login"}
                </Button>
              </CardContent>
            </Card>

            {/* View Menu Only Card */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-gray-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  Just View Menu
                </CardTitle>
                <CardDescription className="text-base">
                  Browse the menu without creating an account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-gray-600 py-4">
                  Quick access to view dishes, prices, and descriptions without
                  any setup required.
                </div>
                <Button
                  onClick={handleViewMenuOnly}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3"
                >
                  View Menu Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-r from-[#5F7161]/5 to-[#5F7161]/10 border-[#5F7161]/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#5F7161] mb-2">
                Why Join as a Food Explorer?
              </CardTitle>
              <CardDescription className="text-base">
                Enhance your dining experience with these exclusive features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-[#5F7161] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Visit Tracking
                  </h3>
                  <p className="text-sm text-gray-600">
                    Keep a digital diary of all your restaurant visits and
                    favorite dishes
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-[#5F7161] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Reviews & Ratings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Share your experiences and help other food explorers
                    discover great dishes
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-[#5F7161] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Achievements
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unlock badges and achievements as you explore new cuisines
                    and restaurants
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Scanned from QR code • Powered by Dish Display
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
