"use client";

import { Award, CheckCircle2, FileText, TrendingUp, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SubmissionScoreSummaryProps {
  studentName: string;
  studentEmail: string;
  multipleChoiceScore: number;
  multipleChoiceTotal: number;
  essayScore: number;
  essayTotal: number;
  essayGraded: number;
  totalEssayQuestions: number;
  totalScore: number;
  maxScore: number;
  isLoading?: boolean;
}

const SubmissionScoreSummary = ({
  studentName,
  studentEmail,
  multipleChoiceScore,
  multipleChoiceTotal,
  essayScore,
  essayTotal,
  essayGraded,
  totalEssayQuestions,
  totalScore,
  maxScore,
  isLoading,
}: SubmissionScoreSummaryProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-6 pt-6 pb-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="mb-6 rounded-xl border-2 p-6">
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const needsGrading = essayGraded < totalEssayQuestions;

  // Helper function to get score color
  const getScoreColor = (score: number, total: number) => {
    if (total === 0) return "text-muted-foreground";
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-500";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  return (
    <Card className="overflow-hidden pt-0">
      <div className="border-b bg-muted/30 px-6 pt-6 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-4 ring-primary/5">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {studentName}
              </h2>
              <p className="text-base text-muted-foreground flex items-center gap-2">
                {studentEmail}
              </p>
            </div>
          </div>
          {needsGrading && (
            <Badge variant="destructive" className="shrink-0 animate-pulse">
              {totalEssayQuestions - essayGraded} pending
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="pt-6">
        {/* Main Score Display */}
        <div className="mb-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Overall Score</span>
            </div>
            <Badge variant="secondary" className="text-sm font-semibold">
              {totalScore} / {maxScore} points
            </Badge>
          </div>
          <div className="flex items-end gap-4">
            <div
              className={cn(
                "text-5xl font-bold",
                getScoreColor(totalScore, maxScore)
              )}
            >
              {percentage}%
            </div>
            <div className="flex-1 mb-2">
              <Progress value={percentage} className="h-3" />
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Multiple Choice */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Multiple Choice
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {multipleChoiceTotal} questions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(multipleChoiceScore, multipleChoiceTotal)
                    )}
                  >
                    {multipleChoiceScore}
                  </span>
                  <span className="text-muted-foreground">
                    / {multipleChoiceTotal}
                  </span>
                </div>
                <Progress
                  value={
                    multipleChoiceTotal > 0
                      ? (multipleChoiceScore / multipleChoiceTotal) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-sm font-medium text-muted-foreground">
                  {multipleChoiceTotal > 0
                    ? Math.round(
                        (multipleChoiceScore / multipleChoiceTotal) * 100
                      )
                    : 0}
                  % correct
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Essay Score */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Essay Score
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalEssayQuestions} questions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(essayScore, essayTotal)
                    )}
                  >
                    {essayScore}
                  </span>
                  <span className="text-muted-foreground">/ {essayTotal}</span>
                </div>
                <Progress
                  value={essayTotal > 0 ? (essayScore / essayTotal) * 100 : 0}
                  className="h-2"
                />
                <p className="text-sm font-medium text-muted-foreground">
                  {essayTotal > 0
                    ? Math.round((essayScore / essayTotal) * 100)
                    : 0}
                  % achieved
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Essay Graded Status */}
          <Card
            className={cn(
              "transition-shadow",
              needsGrading
                ? "bg-orange-50/50 dark:bg-orange-950/20 shadow-sm"
                : "shadow-sm hover:shadow-md"
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    needsGrading
                      ? "bg-orange-100 dark:bg-orange-950"
                      : "bg-green-100 dark:bg-green-950"
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "h-5 w-5",
                      needsGrading
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Grading Status
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {needsGrading ? "In progress" : "Complete"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      needsGrading
                        ? "text-orange-600 dark:text-orange-500"
                        : "text-green-600 dark:text-green-500"
                    )}
                  >
                    {essayGraded}
                  </span>
                  <span className="text-muted-foreground">
                    / {totalEssayQuestions}
                  </span>
                </div>
                <Progress
                  value={
                    totalEssayQuestions > 0
                      ? (essayGraded / totalEssayQuestions) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-sm font-medium text-muted-foreground">
                  {totalEssayQuestions > 0
                    ? Math.round((essayGraded / totalEssayQuestions) * 100)
                    : 0}
                  % graded
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionScoreSummary;
