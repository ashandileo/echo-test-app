"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Loader2,
  Lock,
  Mic,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";
import {
  useListeningTestCount,
  useQuizQuestionCount,
  useSpeakingTestCount,
} from "@/lib/hooks/api/useQuizQuestion";
import { QUIZ_DETAILS } from "@/lib/queryKeys/quiz";

const PublishQuizButton = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get quiz details to check status
  const { data: quiz } = useQuizDetails(itemId);

  // Get counts
  const { data: questionCount } = useQuizQuestionCount(itemId);
  const { data: listeningTestCount = 0 } = useListeningTestCount(itemId);
  const { data: speakingTestCount = 0 } = useSpeakingTestCount(itemId);

  const totalQuestions = questionCount?.total || 0;
  const multipleChoiceCount = questionCount?.multipleChoice || 0;
  const essayCount = questionCount?.essay || 0;

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quiz/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId: itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish quiz");
      }

      return data;
    },
    onMutate: () => {
      // Show loading toast
      toast.loading("Publishing quiz...", {
        id: "publish-quiz",
        description:
          listeningTestCount > 0
            ? `Generating ${listeningTestCount} audio file${listeningTestCount > 1 ? "s" : ""}...`
            : "Preparing quiz...",
      });
    },
    onSuccess: (data) => {
      // Dismiss loading toast
      toast.dismiss("publish-quiz");

      // Show success toast
      const audioMessage =
        data.ttsGenerated > 0
          ? `${data.ttsGenerated} audio file${data.ttsGenerated > 1 ? "s" : ""} generated`
          : data.ttsSkipped > 0
            ? `${data.ttsSkipped} audio file${data.ttsSkipped > 1 ? "s" : ""} already exist`
            : "Quiz is now available for students";

      toast.success("Quiz published successfully! 🎉", {
        description: audioMessage,
        duration: 5000,
      });

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_DETAILS(itemId),
      });

      // Close dialog
      setShowConfirmDialog(false);
    },
    onError: (error: Error) => {
      // Dismiss loading toast
      toast.dismiss("publish-quiz");

      // Show error toast
      toast.error("Failed to publish quiz", {
        description: error.message,
        duration: 5000,
      });
    },
  });

  const handlePublish = () => {
    publishMutation.mutate();
  };

  // Disable if no questions or quiz is not in draft status
  const canPublish = totalQuestions > 0 && quiz?.status === "draft";

  // Don't show button if quiz is already published
  if (quiz?.status !== "draft") {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={!canPublish || publishMutation.isPending}
        className="gap-2"
      >
        {publishMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Rocket className="size-4" />
            Publish Quiz
          </>
        )}
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Rocket className="size-6" />
              Publish Quiz
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              You are about to publish this quiz. Please review the details
              below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Question Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Quiz Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Questions:
                  </span>
                  <span className="font-medium">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Multiple Choice:
                  </span>
                  <span className="font-medium">{multipleChoiceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Essay:</span>
                  <span className="font-medium">{essayCount}</span>
                </div>
              </div>
            </div>

            {/* Special Tests Info */}
            {(listeningTestCount > 0 || speakingTestCount > 0) && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-300">
                  Audio Generation
                </h4>
                <div className="space-y-2 text-sm">
                  {listeningTestCount > 0 && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                      <Headphones className="size-4" />
                      <span>
                        <strong>{listeningTestCount}</strong> audio file
                        {listeningTestCount > 1 ? "s" : ""} will be generated
                        for listening tests
                      </span>
                    </div>
                  )}
                  {speakingTestCount > 0 && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                      <Mic className="size-4" />
                      <span>
                        <strong>{speakingTestCount}</strong> speaking test
                        {speakingTestCount > 1 ? "s" : ""} configured for voice
                        answers
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-900">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-300">
                    ⚠️ Important: This action cannot be undone
                  </h4>
                  <ul className="text-sm text-orange-800 dark:text-orange-400 space-y-1 list-disc list-inside">
                    <li className="flex items-start gap-2">
                      <Lock className="size-3 mt-1 shrink-0" />
                      <span>
                        Questions will be <strong>permanently locked</strong>{" "}
                        and cannot be edited or deleted
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3 mt-1 shrink-0" />
                      <span>
                        Students will be able to take the quiz immediately
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="size-3 mt-1 shrink-0" />
                      <span>
                        <strong>You cannot unpublish</strong> this quiz once
                        it&apos;s published
                      </span>
                    </li>
                    {listeningTestCount > 0 && (
                      <li className="flex items-start gap-2">
                        <Headphones className="size-3 mt-1 shrink-0" />
                        <span>
                          Audio generation may take a few moments depending on
                          the number of questions
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="gap-2"
            >
              {publishMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="size-4" />
                  Publish Now
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PublishQuizButton;
