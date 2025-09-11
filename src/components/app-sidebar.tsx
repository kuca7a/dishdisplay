"use client";

import {
  UserRoundPen,
  Utensils,
  Eye,
  WandSparkles,
  Frame,
  PieChart,
  Map,
  MessageCircleQuestion,
  Sticker,
  QrCode,
  CreditCard,
} from "lucide-react";
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
import { Notable } from "next/font/google";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const data = {
  navMain: [
    {
      title: "Profile",
      url: "#",
      icon: UserRoundPen,
      isActive: true,
      items: [
        {
          title: "Business  Profile",
          url: "/profile/business-profile",
          "data-onboarding": "business-profile",
        },
        {
          title: "Location & Hours",
          url: "/profile/location-hours",
        },
        {
          title: "Media & Branding",
          url: "/profile/media-branding",
        },
        {
          title: "Account Settings",
          url: "/profile/account",
        },
      ],
    },
    {
      title: "Menu",
      url: "#",
      icon: Utensils,
      items: [
        {
          title: "Manage",
          url: "/profile/menu/manage",
          "data-onboarding": "menu-manage",
        },
        {
          title: "Explore",
          url: "/profile/menu/explore",
        },
      ],
    },
    {
      title: "QR Code",
      url: "/profile/qr-code",
      icon: QrCode,
      "data-onboarding": "qr-code",
    },
    {
      title: "Preview",
      url: "/profile/preview",
      icon: Eye,
    },
    {
      title: "Insights",
      url: "/profile/insights",
      icon: WandSparkles,
      "data-onboarding": "insights",
    },
    {
      title: "Subscription",
      url: "/profile/subscription",
      icon: CreditCard,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/profile/support",
      icon: MessageCircleQuestion,
    },
    {
      title: "Feedback",
      url: "/profile/feedback",
      icon: Sticker,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
    <Sidebar variant="inset" {...props}>
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
