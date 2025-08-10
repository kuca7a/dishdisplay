"use client";

import { UserRoundPen, Utensils, Eye, WandSparkles, Frame, PieChart, Map, MessageCircleQuestion, Sticker, QrCode} from "lucide-react";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

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
        },
        {
          title: "Location & Hours",
          url: "/profile/location-hours",
        },
        {
          title: "Media & Branding",
          url: "/profile/media-branding",
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

  const sidebarUser = isAuthenticated && user
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
            </SidebarMenuButton>
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
