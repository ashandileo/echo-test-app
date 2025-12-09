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
import { useProfile, type UserProfile } from "@/lib/hooks/use-profile";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialProfile?: UserProfile;
}

export function AppSidebar({ initialProfile, ...props }: AppSidebarProps) {
  const { data: profile, isLoading } = useProfile(initialProfile);

  // Use initialProfile if profile data is not yet available to prevent flickering
  const currentProfile = profile || initialProfile;

  const userData = currentProfile
    ? {
        name: currentProfile.full_name || currentProfile.email || "User",
        email: currentProfile.email || "",
        avatar: currentProfile.avatar_url || "",
        role: currentProfile.role,
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
        role: "user" as const,
      };

  const role = currentProfile?.role || "user";
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
