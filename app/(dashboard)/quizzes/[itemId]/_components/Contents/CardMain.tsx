'use client";';
import { useParams, useRouter } from "next/navigation";

import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";
import { useQuizQuestionCount } from "@/lib/hooks/api/useQuizQuestion";
import { useQuizSubmissionStatus } from "@/lib/hooks/api/useQuizSubmissionStatus";
import { useUser } from "@/lib/hooks/api/useUser";

const CardMain = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  const { data: quiz, isLoading: isLoadingQuiz } = useQuizDetails(itemId);

  const { data: questionsData, isLoading: isLoadingQuizCount } =
    useQuizQuestionCount(itemId);

  // Get current user and submission status
  const { data: user } = useUser();
  const { data: submissionStatus } = useQuizSubmissionStatus(
    user?.id ?? "",
    itemId
  );

  const isLoading = isLoadingQuiz || isLoadingQuizCount;

  // Determine quiz status
  const isSubmitted = submissionStatus?.status === "submitted";
  const isCompleted = submissionStatus?.status === "completed";
  const isInProgress = submissionStatus?.status === "in_progress";

  const handleStartQuiz = () => {
    router.push(`/take-quiz/${itemId}`);
  };

  const estimatedTime = questionsData
    ? Math.ceil(questionsData.total * 1.5)
    : 0; // 1.5 minutes per question

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">
              {quiz?.name || "Untitled Quiz"}
            </CardTitle>
            <CardDescription className="text-base">
              {quiz?.description || "No description provided"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium">Total Questions</span>
            </div>
            <p className="text-2xl font-bold">{questionsData?.total || 0}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Estimated Time</span>
            </div>
            <p className="text-2xl font-bold">{estimatedTime} min</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">Question Types</span>
            </div>
            <p className="text-sm font-semibold mt-1">
              {questionsData?.multipleChoice || 0} MC ·{" "}
              {questionsData?.essay || 0} Essay
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs font-medium">Difficulty</span>
            </div>
            <p className="text-sm font-semibold mt-1">High School</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full flex flex-col gap-3">
          {isCompleted ? (
            <>
              <Button variant="outline" className="w-full" size="lg" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </Button>
              {submissionStatus?.completed_at && (
                <p className="text-xs text-center text-muted-foreground">
                  Completed on{" "}
                  {new Date(submissionStatus.completed_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}{" "}
                  · Score: {submissionStatus.percentage?.toFixed(0)}%
                </p>
              )}
            </>
          ) : isSubmitted ? (
            <>
              <Button variant="outline" className="w-full" size="lg" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submitted
              </Button>
              {submissionStatus?.submitted_at && (
                <p className="text-xs text-center text-muted-foreground">
                  Submitted on{" "}
                  {new Date(submissionStatus.submitted_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              )}
              <p className="text-xs text-center text-muted-foreground italic">
                Waiting for grading to complete...
              </p>
            </>
          ) : isInProgress ? (
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartQuiz}
                disabled={!questionsData?.total || questionsData.total === 0}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue Quiz
              </Button>
              {submissionStatus?.started_at && (
                <p className="text-xs text-center text-muted-foreground">
                  Started on{" "}
                  {new Date(submissionStatus.started_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              )}
            </>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleStartQuiz}
              disabled={!questionsData?.total || questionsData.total === 0}
            >
              {questionsData?.total === 0
                ? "No Questions Available"
                : "Start Quiz"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardMain;
