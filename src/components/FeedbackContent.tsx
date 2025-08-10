"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Sticker, ThumbsUp, MessageSquare, Lightbulb } from "lucide-react";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function FeedbackContent() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                  <BreadcrumbPage>Feedback</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <Sticker className="h-8 w-8 text-orange-600" />
            <h1 className={`${fjallaOne.className} text-3xl text-gray-800`}>
              Feedback Center
            </h1>
          </div>

          {/* Coming Soon Content */}
          <div className="flex flex-1 flex-col items-center justify-center min-h-[400px]">
            <Card className="max-w-md text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sticker className="h-10 w-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Feedback System Coming Soon
                </h2>
                <p className="text-gray-600 mb-6">
                  We&apos;re building a comprehensive feedback system where you
                  can share suggestions, report issues, and help us improve
                  DishDisplay for all restaurant owners.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Feature Requests</p>
                      <p className="text-xs text-gray-600">
                        Suggest new features and improvements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <ThumbsUp className="h-5 w-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Bug Reports</p>
                      <p className="text-xs text-gray-600">
                        Help us fix issues and improve stability
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">General Feedback</p>
                      <p className="text-xs text-gray-600">
                        Share your thoughts and experiences
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                  In the meantime, feel free to reach out via our Support
                  section!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
