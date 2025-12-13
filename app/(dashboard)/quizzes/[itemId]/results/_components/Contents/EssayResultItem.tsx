"use client";

import { Clock, FileCheck, FileClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EssayResultItemProps {
  questionNumber: number;
  questionText: string;
  answerText: string;
  rubric: string | null;
  points: number;
  pointsEarned: number | null;
  feedback: string | null;
  isGraded: boolean;
  gradedAt: string | null;
}

const EssayResultItem = ({
  questionNumber,
  questionText,
  answerText,
  rubric,
  points,
  pointsEarned,
  feedback,
  isGraded,
  gradedAt,
}: EssayResultItemProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">Question {questionNumber}</CardTitle>
            <CardDescription className="mt-2 text-base text-foreground">
              {questionText}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isGraded ? "default" : "secondary"}>
              {isGraded ? (
                <FileCheck className="h-3 w-3 mr-1" />
              ) : (
                <FileClock className="h-3 w-3 mr-1" />
              )}
              {isGraded ? "Graded" : "Pending Review"}
            </Badge>
            {isGraded && pointsEarned !== null ? (
              <span className="text-sm text-muted-foreground">
                {pointsEarned}/{points} points
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Max: {points} points
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Answer */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Your Answer
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{answerText}</p>
          </div>
        </div>

        {/* Rubric */}
        {rubric && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Grading Rubric
            </p>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500 rounded-r-lg">
              <p className="text-sm text-purple-800 dark:text-purple-400 whitespace-pre-wrap">
                {rubric}
              </p>
            </div>
          </div>
        )}

        {/* Grading Status */}
        {isGraded ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Teacher Feedback
              </p>
              {gradedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Graded on {new Date(gradedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            {feedback ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded-r-lg">
                <p className="text-sm text-green-800 dark:text-green-400 whitespace-pre-wrap">
                  {feedback}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  No feedback provided
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 rounded-r-lg">
            <div className="flex items-start gap-2">
              <FileClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                  Awaiting Teacher Review
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                  Your answer has been submitted and is waiting for the teacher
                  to grade it. You&apos;ll receive feedback once it&apos;s
                  reviewed.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EssayResultItemSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EssayResultItem;
