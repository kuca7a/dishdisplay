"use client";

import { Home, Trophy, Search, Coins } from "lucide-react";
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
import { NavUser } from "@/components/nav-user";
import { Notable } from "next/font/google";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// This is sample data.
const dinerData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/diner",
      icon: Home,
    },
    {
      title: "Discovery",
      url: "/discover",
      icon: Search,
    },
    {
      title: "Leaderboard",
      url: "/diner/leaderboard",
      icon: Trophy,
    },
    {
      title: "Points & Rewards",
      url: "/diner/points",
      icon: Coins,
    },
  ],
};

export function DinerSidebar() {
  const { user, isAuthenticated } = useAuth0();

  const sidebarUser =
    isAuthenticated && user
      ? {
          name: user.name || user.nickname || "User",
          email: user.email || "",
          avatar: user.picture || "/avatars/default.jpg",
        }
      : {
          name: "Guest",
          email: "",
          avatar: "/avatars/default.jpg",
        };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center px-6 py-4">
          <h1 className={`text-xl font-semibold text-[#5F7161] ${notable.className}`}>
            DISH DISPLAY
          </h1>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dinerData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
