"use client";

import { FileText, PenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useQuizTaking } from "../QuizTakingContext";

const TabSwitch = () => {
  const {
    selectedTab,
    currentQuestionIndex,
    currentQuestions,
    mcQuestions,
    essayQuestions,
    answers,
    handleTabSwitch,
  } = useQuizTaking();

  const mcAnswered = mcQuestions?.filter((q) => answers[q.id]).length || 0;
  const essayAnswered =
    essayQuestions?.filter((q) => answers[q.id]).length || 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 md:gap-3">
        <Badge
          variant="outline"
          className="text-sm md:text-base font-bold px-2 md:px-3 py-0.5 md:py-1"
        >
          {currentQuestionIndex + 1} / {currentQuestions.length}
        </Badge>
        <div className="h-4 md:h-5 w-px bg-border" />
        <p className="text-xs md:text-sm text-muted-foreground">
          {selectedTab === "multiple_choice"
            ? "Multiple Choice"
            : "Essay Question"}
        </p>
      </div>

      <div className="flex gap-1 md:gap-2 bg-muted p-0.5 md:p-1 rounded-lg overflow-x-auto">
        <Button
          variant={selectedTab === "multiple_choice" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabSwitch("multiple_choice")}
          disabled={!mcQuestions?.length}
          className={cn(
            "relative text-xs md:text-sm whitespace-nowrap",
            selectedTab === "multiple_choice" && "shadow-sm"
          )}
        >
          <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
          <span className="hidden md:inline">Multiple Choice</span>
          <span className="md:hidden ml-1">MC</span>
          <Badge
            variant={
              selectedTab === "multiple_choice" ? "secondary" : "outline"
            }
            className="ml-1 md:ml-2 text-xs"
          >
            {mcAnswered}/{mcQuestions?.length || 0}
          </Badge>
        </Button>
        <Button
          variant={selectedTab === "essay" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabSwitch("essay")}
          disabled={!essayQuestions?.length}
          className={cn(
            "relative text-xs md:text-sm whitespace-nowrap",
            selectedTab === "essay" && "shadow-sm"
          )}
        >
          <PenLine className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
          <span className="hidden md:inline">Essay</span>
          <span className="md:hidden ml-1">Essay</span>
          <Badge
            variant={selectedTab === "essay" ? "secondary" : "outline"}
            className="ml-1 md:ml-2 text-xs"
          >
            {essayAnswered}/{essayQuestions?.length || 0}
          </Badge>
        </Button>
      </div>
    </div>
  );
};

export default TabSwitch;
