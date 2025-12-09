"use client";

import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const Details = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const supabase = createClient();

  // Fetch quiz details
  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz-details", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch quiz questions count
  const { data: questionsData } = useQuery({
    queryKey: ["quiz-questions-count", itemId],
    queryFn: async () => {
      const [mcData, essayData] = await Promise.all([
        supabase
          .from("quiz_question_multiple_choice")
          .select("id", { count: "exact" })
          .eq("quiz_id", itemId),
        supabase
          .from("quiz_question_essay")
          .select("id", { count: "exact" })
          .eq("quiz_id", itemId),
      ]);

      return {
        multipleChoice: mcData.count || 0,
        essay: essayData.count || 0,
        total: (mcData.count || 0) + (essayData.count || 0),
      };
    },
  });

  const handleStartQuiz = () => {
    console.log(`Starting quiz: ${itemId}`);
    // TODO: Navigate to quiz taking page
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {/* Header Card Skeleton */}
        <Card className="border-2">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        {/* Quiz Information Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const estimatedTime = questionsData
    ? Math.ceil(questionsData.total * 1.5)
    : 0; // 1.5 minutes per question

  return (
    <div className="grid gap-6">
      {/* Main Quiz Card */}
      <Card className="border-2 border-primary/20">
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
        </CardFooter>
      </Card>

      {/* Quiz Information */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>Additional details about this quiz</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Name
            </p>
            <p className="text-base">{quiz?.name || "Untitled Quiz"}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </p>
            <p className="text-base leading-relaxed">
              {quiz?.description || "No description provided"}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Published Date
              </p>
              <p className="text-base">
                {quiz?.published_at
                  ? formatDate(quiz.published_at)
                  : "Not published"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created Date
              </p>
              <p className="text-base">
                {quiz?.created_at ? formatDate(quiz.created_at) : "N/A"}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Question Breakdown
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Multiple Choice
                  </span>
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">
                  {questionsData?.multipleChoice || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">questions</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Essay</span>
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {questionsData?.essay || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">questions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Quiz Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                •
              </span>
              <span>
                Read each question carefully before selecting your answer
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                •
              </span>
              <span>You can navigate between questions during the quiz</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                •
              </span>
              <span>
                Make sure to submit your quiz before the time runs out
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                •
              </span>
              <span>For essay questions, write clear and complete answers</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Details;
