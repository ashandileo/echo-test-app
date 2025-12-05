"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const navigations = [
  {
    id: "information",
    label: "Information",
  },
  {
    id: "configuration",
    label: "Configuration",
  },
  {
    id: "settings",
    label: "Settings",
  },
];

export default function QuizDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabId = pathname.split("/")[2] || "";

  const { itemId } = useParams<{ itemId: string }>();

  const isActive = (path: string) => {
    if (path === "information") {
      return pathname === `/quiz/${tabId}`;
    }
    return pathname === `/quiz/${tabId}/${path}`;
  };

  return (
    <>
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
          {navigations.map((navigation) => (
            <Button
              key={navigation.id}
              variant="ghost"
              className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                isActive(navigation.id)
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              asChild
            >
              <Link
                href={
                  navigation.id === "information"
                    ? `/quiz/${itemId}`
                    : `/quiz/${itemId}/${navigation.id}`
                }
              >
                {navigation.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      {children}
    </>
  );
}
