"use client";

import { useParams } from "next/navigation";

import { CheckCircle, XCircle } from "lucide-react";

import { QuizPublish } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetails, useQuizStatusUpdate } from "@/lib/hooks/api/useQuiz";
import useActions from "@/lib/hooks/useAction";

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
  const { action, setAction, clearAction, isAction } = useActions<
    Actions,
    ActionMetadata
  >();

  // Fetch quiz details
  const { data: quiz, isLoading } = useQuizDetails(itemId);

  // Mutation for updating quiz status
  const { mutate: updateStatus } = useQuizStatusUpdate(itemId);

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
    updateStatus(newStatus, {
      onSuccess: () => {
        clearAction();
      },
    });
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
              ? "border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              : ""
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
