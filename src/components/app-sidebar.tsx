"use client";

import { UserRoundPen, Utensils, Eye, WandSparkles, Frame, PieChart, Map, MessageCircleQuestion, Sticker} from "lucide-react";
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
          url: "#",
        },
        {
          title: "Location & Hours",
          url: "#",
        },
        {
          title: "Media & Branding",
          url: "#",
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
          url: "#",
        },
        {
          title: "Explore",
          url: "#",
        },
      ],
    },
    {
      title: "Preview",
      url: "#",
      icon: Eye,
    },
    {
      title: "Insights",
      url: "#",
      icon: WandSparkles,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: MessageCircleQuestion,
    },
    {
      title: "Feedback",
      url: "#",
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
