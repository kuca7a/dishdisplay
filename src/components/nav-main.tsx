"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("/profile/preview", "_blank", "noopener,noreferrer");
  };

  return (
    <SidebarGroup className={rubik.className}>
      <SidebarGroupLabel>Account</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.items?.length ? (
                // If has sub-items, make the main button trigger the collapsible
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="cursor-pointer group"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                // If no sub-items, make it a regular link
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="cursor-pointer"
                >
                  {item.title === "Preview" ? (
                    <a href="#" onClick={handlePreviewClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  ) : item.url !== "#" ? (
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className="cursor-pointer"
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
