"use client";

import { Award, CheckCircle2, FileText, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const needsGrading = essayGraded < totalEssayQuestions;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-2xl">{studentName}</CardTitle>
              {needsGrading && (
                <Badge variant="destructive">Needs Grading</Badge>
              )}
            </div>
            <CardDescription className="text-base">
              {studentEmail}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total Score */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Total Score</span>
            </div>
            <div className="text-3xl font-bold text-primary">{percentage}%</div>
            <div className="text-xs text-muted-foreground">
              {totalScore} / {maxScore} points
            </div>
          </div>

          {/* Multiple Choice */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Multiple Choice</span>
            </div>
            <div className="text-2xl font-bold">
              {multipleChoiceScore}/{multipleChoiceTotal}
            </div>
            <div className="text-xs text-muted-foreground">
              {multipleChoiceTotal > 0
                ? Math.round((multipleChoiceScore / multipleChoiceTotal) * 100)
                : 0}
              %
            </div>
          </div>

          {/* Essay Score */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Essay Score</span>
            </div>
            <div className="text-2xl font-bold">
              {essayScore}/{essayTotal}
            </div>
            <div className="text-xs text-muted-foreground">
              {essayTotal > 0 ? Math.round((essayScore / essayTotal) * 100) : 0}
              %
            </div>
          </div>

          {/* Essay Graded */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Essays Graded</span>
            </div>
            <div className="text-2xl font-bold">
              {essayGraded}/{totalEssayQuestions}
            </div>
            {needsGrading && (
              <Badge variant="outline" className="text-xs w-fit">
                {totalEssayQuestions - essayGraded} pending
              </Badge>
            )}
          </div>

          {/* Grading Status */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Status</span>
            </div>
            <div className="mt-1">
              {needsGrading ? (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  Pending
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-700"
                >
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionScoreSummary;
