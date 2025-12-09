"use client";

import { useParams } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { QuizPublish } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useActions from "@/lib/hooks/useAction";
import { createClient } from "@/lib/supabase/client";

enum Actions {
  PUBLISH = "PUBLISH",
  UNPUBLISH = "UNPUBLISH",
}

type ActionMetadata = {
  status: "draft" | "published" | "archived";
  name: string;
};

const Publish = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const supabase = createClient();
  const queryClient = useQueryClient();
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

  // Mutation for updating quiz status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: "draft" | "published") => {
      const { error } = await supabase
        .from("quiz")
        .update({ status: newStatus })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-details", itemId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success(
        `Quiz ${newStatus === "published" ? "published" : "unpublished"} successfully`
      );
      clearAction();
    },
    onError: (error) => {
      console.error("Failed to update quiz status:", error);
      toast.error("Failed to update quiz status. Please try again.");
    },
  });

  const handlePublishClick = () => {
    if (!quiz) return;

    if (quiz.status === "published") {
      setAction(Actions.UNPUBLISH, {
        status: quiz.status,
        name: quiz.name,
      });
    } else {
      setAction(Actions.PUBLISH, {
        status: quiz.status,
        name: quiz.name,
      });
    }
  };

  const handleConfirm = async () => {
    if (!quiz) return;

    const newStatus = quiz.status === "published" ? "draft" : "published";
    await updateStatusMutation.mutateAsync(newStatus);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  const isPublished = quiz?.status === "published";

  return (
    <>
      <div>
        <Button
          onClick={handlePublishClick}
          variant={isPublished ? "outline" : "default"}
          className={
            isPublished
              ? "border-yellow-600 text-yellow-600 hover:bg-yellow-50"
              : "bg-green-600 hover:bg-green-700"
          }
        >
          {isPublished ? (
            <>
              <XCircle className="mr-2 size-4" />
              Unpublish
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 size-4" />
              Publish
            </>
          )}
        </Button>
      </div>

      <QuizPublish
        open={isAction(Actions.PUBLISH) || isAction(Actions.UNPUBLISH)}
        onOpenChange={(open) => !open && clearAction()}
        onConfirm={handleConfirm}
        currentStatus={action?.data?.status || "draft"}
        quizName={action?.data?.name}
      />
    </>
  );
};

export default Publish;
