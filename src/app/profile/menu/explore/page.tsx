"use client";

// Force dynamic rendering to prevent prerender issues with Auth0
export const dynamic = "force-dynamic";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Sample menu items for exploration
const sampleMenuItems = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Main Course",
    cuisine: "Italian",
    popularity: "High",
  },
  {
    id: 2,
    name: "Caesar Salad",
    category: "Appetizer",
    cuisine: "Italian",
    popularity: "Medium",
  },
  {
    id: 3,
    name: "Chocolate Lava Cake",
    category: "Dessert",
    cuisine: "American",
    popularity: "High",
  },
  {
    id: 4,
    name: "Pad Thai",
    category: "Main Course",
    cuisine: "Thai",
    popularity: "High",
  },
  {
    id: 5,
    name: "Chicken Wings",
    category: "Appetizer",
    cuisine: "American",
    popularity: "Medium",
  },
  {
    id: 6,
    name: "Tiramisu",
    category: "Dessert",
    cuisine: "Italian",
    popularity: "Medium",
  },
];

export default function MenuExplorePage() {
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
        <div className={fjallaOne.className}>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/profile">Menu</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Explore</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-orange-600" />
                  <div>
                    <h1 className="text-3xl font-bold">Explore Menu Ideas</h1>
                    <p className="text-gray-600">
                      Discover popular dishes and menu inspiration
                    </p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to My Menu
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search for dishes, ingredients, or cuisines..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                      <Button variant="outline" size="sm">
                        <Grid className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                      <Button variant="outline" size="sm">
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Appetizers",
                  "Main Courses",
                  "Desserts",
                  "Popular",
                  "Trending",
                ].map((category) => (
                  <Button
                    key={category}
                    variant={category === "All" ? "default" : "outline"}
                    size="sm"
                    className={
                      category === "All"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : ""
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.popularity === "High"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.popularity}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Cuisine:</span>
                          <span className="font-medium">{item.cuisine}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                          >
                            Add to Menu
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center pt-6">
                <Button variant="outline" className="w-full md:w-auto">
                  Load More Menu Ideas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
