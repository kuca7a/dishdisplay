"use client";

import React, { Suspense } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Notable } from "next/font/google";
import { 
  QrCode, 
  BarChart3, 
  MenuIcon, 
  Camera,
  Trophy,
  Star,
  MapPin,
  Heart,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function LoginContent() {
  const { loginWithRedirect } = useAuth0();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRestaurantOwnerLogin = () => {
    const returnTo = searchParams.get('returnTo');
    loginWithRedirect({
      appState: { 
        returnTo: returnTo || '/profile', 
        userType: 'restaurant_owner' 
      }
    });
  };

  const handleDinerLogin = () => {
    const returnTo = searchParams.get('returnTo');
    loginWithRedirect({
      appState: { 
        returnTo: returnTo || '/diner', 
        userType: 'diner' 
      }
    });
  };

  const restaurantFeatures = [
    {
      icon: <MenuIcon className="h-5 w-5" />,
      title: "Digital Menu Management",
      description: "Upload and manage your menu items with beautiful photos"
    },
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "QR Code Generation",
      description: "Create custom QR codes for instant menu access"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Analytics & Insights",
      description: "Track menu views, popular items, and customer engagement"
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "Photo Management",
      description: "Showcase your dishes with high-quality images"
    }
  ];

  const dinerFeatures = [
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Leaderboard Competitions",
      description: "Compete with other diners and win prizes"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Reviews & Ratings",
      description: "Share your dining experiences and earn points"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Visit Tracking",
      description: "Log your restaurant visits and build your dining history"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Rewards & Badges",
      description: "Earn achievements and unlock special rewards"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className={`text-2xl font-semibold text-black ${notable.className} hover:text-[#5F7161] transition-colors`}
            >
              DISH DISPLAY
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to use Dish Display. Each path offers unique features tailored to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Restaurant Owner Card */}
          <Card className="relative overflow-hidden border-2 hover:border-[#5F7161] transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#5F7161] to-[#4C5B4F]"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Restaurant Owner
                </CardTitle>
                <div className="bg-[#5F7161]/10 p-3 rounded-full">
                  <MenuIcon className="h-8 w-8 text-[#5F7161]" />
                </div>
              </div>
              <p className="text-gray-600">
                Manage your restaurant's digital presence and showcase your menu beautifully
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {restaurantFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-[#5F7161]/10 p-2 rounded-lg flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleRestaurantOwnerLogin}
                  className="w-full bg-[#5F7161] hover:bg-[#4C5B4F] text-white py-3 text-lg font-medium group"
                  size="lg"
                >
                  Continue as Restaurant Owner
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Perfect for restaurant owners and managers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Diner Card */}
          <Card className="relative overflow-hidden border-2 hover:border-[#5F7161] transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#5F7161] to-[#4C5B4F]"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Food Explorer
                </CardTitle>
                <div className="bg-[#5F7161]/10 p-3 rounded-full">
                  <Trophy className="h-8 w-8 text-[#5F7161]" />
                </div>
              </div>
              <p className="text-gray-600">
                Discover restaurants, earn rewards, and compete with fellow food lovers
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {dinerFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-[#5F7161]/10 p-2 rounded-lg flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleDinerLogin}
                  className="w-full bg-[#5F7161] hover:bg-[#4C5B4F] text-white py-3 text-lg font-medium group"
                  size="lg"
                >
                  Continue as Food Explorer
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Perfect for diners and food enthusiasts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Don't have an account? No problem! You'll be able to create one in the next step.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F7161] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
