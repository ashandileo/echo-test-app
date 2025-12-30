"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizPublishProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  currentStatus: "draft" | "published" | "archived";
  quizName?: string;
}

const QuizPublish = ({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  quizName,
}: QuizPublishProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const isPublishing = currentStatus !== "published";
  const action = isPublishing ? "publish" : "unpublish";
  const actionTitle = isPublishing ? "Publish Quiz" : "Unpublish Quiz";

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error(`${action} failed:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {isPublishing ? (
              <>
                Are you sure you want to publish{" "}
                {quizName ? `"${quizName}"` : "this quiz"}? This will make it
                available to users.
              </>
            ) : (
              <>
                Are you sure you want to unpublish{" "}
                {quizName ? `"${quizName}"` : "this quiz"}? This will change its
                status back to draft and it will no longer be available to
                users.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isProcessing}
            className={
              isPublishing
                ? "" // Use default primary blue for publish
                : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isPublishing ? "Publishing..." : "Unpublishing..."}
              </>
            ) : isPublishing ? (
              "Publish"
            ) : (
              "Unpublish"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuizPublish;
