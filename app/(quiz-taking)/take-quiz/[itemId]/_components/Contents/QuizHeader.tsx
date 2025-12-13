"use client";

import { ArrowLeft, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useQuizTaking } from "../QuizTakingContext";

const QuizHeader = () => {
  const { quiz, answeredCount, totalQuestions, handleExit } = useQuizTaking();

  return (
    <div className="flex items-center justify-between mb-4 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>
        <div>
          <h1 className="text-xl font-bold">{quiz?.name || "Quiz"}</h1>
          <p className="text-xs text-muted-foreground">
            {answeredCount} / {totalQuestions} answered
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">45:00</span>
      </div>
    </div>
  );
};

export default QuizHeader;
