"use client";

import { ArrowLeft, BookOpen, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useQuizTaking } from "../QuizTakingContext";

const QuizHeader = () => {
  const { quiz, answeredCount, totalQuestions, handleExit } = useQuizTaking();

  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="shrink-0 mb-4 md:mb-6">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <ArrowLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Exit Quiz</span>
        </Button>
        <div className="hidden md:block h-6 w-px bg-border" />
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-xl font-bold tracking-tight truncate">
              {quiz?.name || "Quiz"}
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Question {answeredCount} of {totalQuestions} completed
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-1.5 md:h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{answeredCount} answered</span>
          <span>{totalQuestions - answeredCount} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
