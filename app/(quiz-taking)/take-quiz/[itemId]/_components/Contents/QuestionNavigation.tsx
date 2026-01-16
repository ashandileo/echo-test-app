"use client";

import { CheckCircle2, List } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useQuizTaking } from "../QuizTakingContext";

interface QuestionNavigationProps {
  isMobile?: boolean;
  onQuestionSelect?: () => void;
}

const QuestionNavigation = ({
  isMobile = false,
  onQuestionSelect,
}: QuestionNavigationProps) => {
  const {
    currentQuestions,
    currentQuestionIndex,
    answers,
    setCurrentQuestionIndex,
  } = useQuizTaking();

  const answeredCount = currentQuestions.filter((q) => answers[q.id]).length;

  return (
    <Card
      className={cn(
        "flex flex-col shrink-0 shadow-lg",
        isMobile ? "w-full border-0 shadow-none" : "w-80"
      )}
    >
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Questions</CardTitle>
          </div>
          <Badge variant="secondary" className="font-semibold">
            {answeredCount}/{currentQuestions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div
          className={cn(
            "overflow-y-auto",
            isMobile ? "max-h-[calc(100vh-300px)]" : "h-[calc(100vh-250px)]"
          )}
        >
          <div
            className={cn(
              "grid gap-2 pr-2",
              isMobile ? "grid-cols-5 sm:grid-cols-6" : "grid-cols-6"
            )}
          >
            {currentQuestions.map((question, index) => {
              const isAnswered = !!answers[question.id];
              const isCurrent = currentQuestionIndex === index;

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    if (onQuestionSelect) {
                      onQuestionSelect();
                    }
                  }}
                  className={cn(
                    "relative aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all hover:scale-105 active:scale-95",
                    isCurrent &&
                      !isAnswered &&
                      "border-primary bg-primary text-primary-foreground shadow-md",
                    isCurrent &&
                      isAnswered &&
                      "border-green-600 bg-green-600 text-white shadow-md",
                    !isCurrent &&
                      isAnswered &&
                      "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                    !isCurrent &&
                      !isAnswered &&
                      "border-border hover:border-primary/50 hover:bg-accent"
                  )}
                  title={`Question ${index + 1}${isAnswered ? " - Answered" : " - Not answered"}`}
                >
                  {isAnswered && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-background rounded-full" />
                  )}
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded border-2 border-primary bg-primary" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-50 relative">
              <CheckCircle2 className="absolute -top-0.5 -right-0.5 h-3 w-3 text-green-600 bg-background rounded-full" />
            </div>
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded border-2 border-border" />
            <span className="text-muted-foreground">Unanswered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigation;
