"use client";

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

interface QuizSubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting?: boolean;
}

export function QuizSubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  answeredCount,
  totalQuestions,
  isSubmitting = false,
}: QuizSubmitConfirmDialogProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to submit your quiz? This action cannot be
                undone.
              </p>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Questions Answered:</span>
                  <span className="font-semibold">
                    {answeredCount} / {totalQuestions}
                  </span>
                </div>

                {hasUnanswered && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span className="font-medium">Unanswered Questions:</span>
                    <span className="font-semibold">{unansweredCount}</span>
                  </div>
                )}
              </div>

              {hasUnanswered && (
                <p className="text-sm text-destructive font-medium">
                  ⚠️ You have {unansweredCount} unanswered question
                  {unansweredCount > 1 ? "s" : ""}. These will be marked as
                  incorrect.
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Once submitted, your answers will be graded automatically. Essay
                questions may require manual grading.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className="bg-primary"
          >
            {isSubmitting ? "Submitting..." : "Yes, Submit Quiz"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
