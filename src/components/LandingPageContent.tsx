"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import ReviewRewardsSection from "@/components/ReviewRewardsSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function LandingPageContent() {
  return (
    <div className="min-h-screen">
      <SpeedInsights />
      <Navbar />
      
      <HeroSection />

      <HowItWorksSection />

      <PricingSection />

      <AnalyticsSection />

      <ReviewRewardsSection />

      <WhyChooseUsSection />

      <Footer />
    </div>
  );
}
