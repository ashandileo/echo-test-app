'use client";';
import { useParams, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Clock, FileText, GraduationCap } from "lucide-react";

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
import { createClient } from "@/lib/supabase/client";

const CardMain = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const supabase = createClient();

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const userId = userData?.id;

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz-details", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: questionsData, isLoading: isLoadingQuizCount } = useQuery({
    queryKey: ["quiz-questions-count", itemId],
    queryFn: async () => {
      const supabase = createClient();

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

  // Check if user has submissions
  const { data: hasSubmissions } = useQuery({
    queryKey: ["user-has-submissions", itemId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const supabase = createClient();

      const [mcSubmissions, essaySubmissions] = await Promise.all([
        supabase
          .from("quiz_submission_multiple_choice")
          .select("id", { count: "exact", head: true })
          .eq("quiz_id", itemId)
          .eq("user_id", userId),
        supabase
          .from("quiz_submission_essay")
          .select("id", { count: "exact", head: true })
          .eq("quiz_id", itemId)
          .eq("user_id", userId),
      ]);

      return (
        (mcSubmissions.count || 0) > 0 || (essaySubmissions.count || 0) > 0
      );
    },
    enabled: !!userId,
  });

  const isLoading = isLoadingQuiz || isLoadingQuizCount;

  const handleStartQuiz = () => {
    router.push(`/take-quiz/${itemId}`);
  };

  const handleViewResults = () => {
    router.push(`/quizzes/${itemId}/results`);
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
        <div className="w-full flex gap-3">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleStartQuiz}
            disabled={!questionsData?.total || questionsData.total === 0}
          >
            {questionsData?.total === 0
              ? "No Questions Available"
              : "Start Quiz"}
          </Button>
          {hasSubmissions && (
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleViewResults}
            >
              View Results
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardMain;
