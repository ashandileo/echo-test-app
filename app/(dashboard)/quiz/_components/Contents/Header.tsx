"use client";
import { Separator } from "@radix-ui/react-separator";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuizzes } from "@/lib/hooks/api/useQuiz";

import Add from "../Controls/Add";

const Header = () => {
  const { data: quizzes } = useQuizzes();

  return (
    <header className="sticky top-0 z-10 flex shrink-0 flex-col gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-6 md:px-8 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Quiz Library
            </h1>
            <p className="text-xs text-muted-foreground">
              Create, manage, and organize quizzes for your students
            </p>
          </div>
        </div>
        {quizzes && quizzes?.length > 0 && <Add />}
      </div>
    </header>
  );
};

export default Header;
