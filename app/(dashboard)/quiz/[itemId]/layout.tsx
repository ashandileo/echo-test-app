"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";

import PublishQuizButton from "./configuration/_components/PublishQuizButton";

const navigations = [
  {
    id: "information",
    label: "Overview",
    description: "Quiz details and learning materials",
  },
  {
    id: "configuration",
    label: "Questions",
    description: "Create and manage questions",
  },
  {
    id: "submissions",
    label: "Submissions",
    description: "Monitor student responses",
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

  // Fetch quiz details to get the quiz name
  const { data: quiz, isLoading } = useQuizDetails(itemId);

  const isActive = (path: string) => {
    if (path === "information") {
      return pathname === `/quiz/${tabId}`;
    }
    return pathname === `/quiz/${tabId}/${path}`;
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex shrink-0 flex-col border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:py-4">
        <div className="flex items-center justify-between gap-4 px-4 py-6 md:px-8">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <Link href="/quiz">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="space-y-0.5 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-3 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
                    {quiz?.name || "Quiz Details"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Configure and manage your quiz settings
                  </p>
                </>
              )}
            </div>
          </div>
          <PublishQuizButton />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 md:px-8">
          {navigations.map((navigation) => (
            <Button
              key={navigation.id}
              variant="ghost"
              className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                isActive(navigation.id)
                  ? "border-primary text-primary font-semibold"
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
      </header>
      {children}
    </div>
  );
}
