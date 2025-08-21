"use client";

import { User, MapPin, Star, MessageCircleQuestion, Home } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const dinerData = {
  navMain: [
    {
      title: "My Profile",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Profile Overview",
          url: "/diner",
        },
        {
          title: "Visit History",
          url: "/diner#visits",
        },
        {
          title: "My Reviews",
          url: "/diner#reviews",
        },
        {
          title: "Points & Rewards",
          url: "/diner#rewards",
        },
        {
          title: "Achievements",
          url: "/diner#badges",
        },
      ],
    },
    {
      title: "Discover",
      url: "#",
      icon: MapPin,
      items: [
        {
          title: "Find Restaurants",
          url: "/discover",
        },
        {
          title: "Browse Menus",
          url: "/browse",
        },
        {
          title: "Popular Places",
          url: "/popular",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      icon: Star,
      items: [
        {
          title: "Recent Reviews",
          url: "/reviews",
        },
        {
          title: "Leaderboard",
          url: "/diner/leaderboard",
        },
        {
          title: "Food Competitions",
          url: "/competitions",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: MessageCircleQuestion,
    },
  ],
};

export function DinerSidebar() {
  const { user } = useAuth0();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/diner">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">DishDisplay</span>
                  <span className="text-xs">Diner Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dinerData.navMain} />
        <NavSecondary items={dinerData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name || "",
              email: user.email || "",
              avatar: user.picture || "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
