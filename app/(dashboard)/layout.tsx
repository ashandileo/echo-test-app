import React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUserWithProfile } from "@/lib/auth/get-user";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Get user profile from server to avoid flickering
  const { profile } = await getUserWithProfile();

  return (
    <SidebarProvider>
      <AppSidebar initialProfile={profile} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
