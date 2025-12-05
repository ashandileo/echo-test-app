"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Contents from "./_components/Contents/Contents";
import Add from "./_components/Controls/Add";
import { Separator } from "@radix-ui/react-separator";

export default function QuizPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Quiz Management</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quiz List</h2>
            <p className="text-muted-foreground">
              Manage and create quizzes for your students
            </p>
          </div>
          <Add />
        </div>
        <Contents />
      </div>
    </>
  );
}
