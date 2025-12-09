"use client";

import * as React from "react";

import Link from "next/link";

import { ClipboardList, GraduationCap } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/lib/hooks/use-profile";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profile, isLoading } = useProfile();

  const userData = profile
    ? {
        name: profile.full_name || profile.email || "User",
        email: profile.email || "",
        avatar: profile.avatar_url || "",
        role: profile.role,
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
        role: "user" as const,
      };

  const role = profile?.role || "user";
  const isAdmin = role === "admin";

  const navMain = [
    isAdmin
      ? {
          title: "Quiz",
          url: "/quiz",
          icon: ClipboardList,
          isActive: true,
        }
      : {
          title: "Quizzes",
          url: "/quizzes",
          icon: ClipboardList,
          isActive: false,
        },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">EchoTest</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI-Powered English Learning
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <NavUser user={userData} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
