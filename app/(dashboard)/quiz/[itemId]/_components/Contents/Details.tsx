import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { FileText, Pencil } from "lucide-react";

import QuizEditDetails from "@/components/dialogs/quiz/QuizEditDetails";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useActions from "@/lib/hooks/useAction";
import { createClient } from "@/lib/supabase/client";

enum Actions {
  EDIT = "EDIT",
}

type ActionMetadata = {
  name: string;
  description: string | null;
};

const Details = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const supabase = createClient();
  const { action, setAction, clearAction, isAction } = useActions<
    Actions,
    ActionMetadata
  >();

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

  // Fetch question breakdown count
  const { data: questionCountData } = useQuery({
    queryKey: ["quiz-question-breakdown", itemId],
    queryFn: async () => {
      const { count: countMultipleChoice } = await supabase
        .from("quiz_question_multiple_choice")
        .select("id", {
          count: "exact",
          head: true,
        });

      const { count: countEssay } = await supabase
        .from("quiz_question_essay")
        .select("id", {
          count: "exact",
          head: true,
        });

      return {
        multipleChoice: countMultipleChoice || 0,
        essay: countEssay || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>
                Basic information about your quiz
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Pencil className="size-4" />
              <span className="sr-only">Edit quiz information</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Name
            </p>
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Description
            </p>
            <Skeleton className="h-6 w-full" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Status
            </p>
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Created At
              </p>
              <Skeleton className="h-6 w-full" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Last Updated
              </p>
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEditClick = () => {
    setAction(Actions.EDIT, {
      name: quiz?.name || "",
      description: quiz?.description || null,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle>Details</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditClick}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit quiz information</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Name
            </p>
            <p className="text-base">{quiz?.name || "Untitled Quiz"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Description
            </p>
            <p className="text-base">
              {quiz?.description || "No description provided"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Status
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  quiz?.status === "published"
                    ? "bg-green-100 text-green-800"
                    : quiz?.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {quiz?.status?.charAt(0).toUpperCase() + quiz?.status?.slice(1)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Created At
              </p>
              <p className="text-base">
                {new Date(quiz.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Last Updated
              </p>
              <p className="text-base">
                {new Date(quiz.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
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
                  {questionCountData?.multipleChoice ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">questions</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Essay</span>
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {questionCountData?.essay ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">questions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuizEditDetails
        open={isAction(Actions.EDIT)}
        onOpenChange={(open) => !open && clearAction()}
        quizId={itemId}
        defaultValues={action?.data ?? undefined}
      />
    </>
  );
};

export default Details;
