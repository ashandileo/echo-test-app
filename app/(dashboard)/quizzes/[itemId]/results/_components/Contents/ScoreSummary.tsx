"use client";

import { Award, CheckCircle2, Clock, FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ScoreSummaryProps {
  totalQuestions: number;
  answeredQuestions: number;
  multipleChoiceScore: number;
  multipleChoiceTotal: number;
  essayGraded: number;
  essayTotal: number;
  essayScore: number;
  isLoading?: boolean;
}

const ScoreSummary = ({
  totalQuestions,
  answeredQuestions,
  multipleChoiceScore,
  multipleChoiceTotal,
  essayGraded,
  essayTotal,
  essayScore,
  isLoading,
}: ScoreSummaryProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

  const totalScore = multipleChoiceScore + essayScore;
  const totalPossible = multipleChoiceTotal + essayTotal;
  const percentage =
    totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Summary</CardTitle>
        <CardDescription>
          Review your score and detailed answers below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Total Score</span>
            </div>
            <div className="text-2xl font-bold">
              {totalScore}/{totalPossible}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({percentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Multiple Choice</span>
            </div>
            <div className="text-2xl font-bold">
              {multipleChoiceScore}/{multipleChoiceTotal}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Essay Graded</span>
            </div>
            <div className="text-2xl font-bold">
              {essayGraded}/{essayTotal}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Answered</span>
            </div>
            <div className="text-2xl font-bold">
              {answeredQuestions}/{totalQuestions}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreSummary;
