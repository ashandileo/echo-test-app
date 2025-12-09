import { Separator } from "@radix-ui/react-separator";
import { BookOpen } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/get-user";

import Contents from "./_components/Contents/Contents";

export default async function QuizzesPage() {
  // Only allow regular users (not admin)
  await requireUser();
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Available Quizzes</h1>
        </div>
      </header>
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">
              English Quizzes
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Choose a quiz to test and improve your English skills
          </p>
        </div>
        <Contents />
      </div>
    </div>
  );
}
