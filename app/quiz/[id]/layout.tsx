"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function QuizDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Extract quiz ID from pathname
  const quizId = pathname.split("/")[2] || "";

  const isActive = (path: string) => {
    if (path === "information") {
      return pathname === `/quiz/${quizId}`;
    }
    return pathname === `/quiz/${quizId}/${path}`;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/quiz">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">Create Quiz</h1>
          </div>
        </header>
        {/* Navigation Tabs */}
        <div className="border-b">
          <div className="flex items-center gap-1 px-4">
            <Button
              variant="ghost"
              className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                isActive("information")
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              asChild
            >
              <Link href={`/quiz/${quizId}`}>Information</Link>
            </Button>
            <Button
              variant="ghost"
              className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                isActive("configuration")
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              asChild
            >
              <Link href={`/quiz/${quizId}/configuration`}>Configuration</Link>
            </Button>
            <Button
              variant="ghost"
              className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                isActive("settings")
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              asChild
            >
              <Link href={`/quiz/${quizId}/settings`}>Settings</Link>
            </Button>
          </div>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
