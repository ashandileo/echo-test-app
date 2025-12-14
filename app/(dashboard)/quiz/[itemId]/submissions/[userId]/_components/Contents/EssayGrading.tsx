"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, FileText, Loader2, Save, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface EssayGradingProps {
  questionNumber: number;
  questionText: string;
  answerText: string;
  rubric: string | null;
  maxPoints: number;
  pointsEarned: number | null;
  feedback: string | null;
  isGraded: boolean;
  gradedAt: string | null;
  submissionId: string;
  quizId: string;
  userId: string;
  studentName?: string;
}

const EssayGrading = ({
  questionNumber,
  questionText,
  answerText,
  rubric,
  maxPoints,
  pointsEarned,
  feedback,
  isGraded,
  gradedAt,
  submissionId,
  quizId,
  userId,
  studentName,
}: EssayGradingProps) => {
  const [points, setPoints] = useState<string>(pointsEarned?.toString() || "");
  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    feedback || ""
  );

  const queryClient = useQueryClient();

  // AI Generate mutation
  const aiGenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quiz/grade-essay-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText,
          rubric,
          studentAnswer: answerText,
          maxPoints,
          studentName: studentName ? studentName.split(" ")[0] : "Student",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate AI suggestions");
      }

      return response.json() as Promise<{
        suggestedScore: number;
        feedback: string;
      }>;
    },
    onSuccess: (data) => {
      // Auto-fill the form with AI suggestions
      setPoints(data.suggestedScore.toString());
      setTeacherFeedback(data.feedback);
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async () => {
      const pointsValue = parseFloat(points);

      if (isNaN(pointsValue) || pointsValue < 0 || pointsValue > maxPoints) {
        throw new Error(`Points must be between 0 and ${maxPoints}`);
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("quiz_submission_essay")
        .update({
          points_earned: pointsValue,
          feedback: teacherFeedback || null,
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["quiz-essay-submissions", quizId, userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-submission-status", quizId],
      });
    },
  });

  const handleSave = () => {
    gradeMutation.mutate();
  };

  const handleAIGenerate = () => {
    aiGenerateMutation.mutate();
  };

  const hasChanges =
    points !== (pointsEarned?.toString() || "") ||
    teacherFeedback !== (feedback || "");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Essay Question {questionNumber}
            </CardTitle>
            <CardDescription className="mt-2 text-base text-foreground">
              {questionText}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isGraded ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Graded
              </Badge>
            ) : (
              <Badge variant="secondary">Not Graded</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Max: {maxPoints} points
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rubric */}
        {rubric && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500 rounded-r-lg">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
              Grading Rubric
            </p>
            <p className="text-sm text-purple-800 dark:text-purple-400 whitespace-pre-wrap">
              {rubric}
            </p>
          </div>
        )}

        {/* Student Answer */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Student&apos;s Answer
          </Label>
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm whitespace-pre-wrap">{answerText}</p>
          </div>
        </div>

        {/* Grading Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Grading</h3>

            {/* AI Generate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIGenerate}
              disabled={aiGenerateMutation.isPending || !answerText}
              className="gap-2"
            >
              {aiGenerateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Suggestions
                </>
              )}
            </Button>
          </div>

          {/* AI Error Message */}
          {aiGenerateMutation.isError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                AI Error: {(aiGenerateMutation.error as Error).message}
              </p>
            </div>
          )}

          {/* AI Success Message */}
          {aiGenerateMutation.isSuccess && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✨ AI suggestions applied! Review and adjust as needed before
                saving.
              </p>
            </div>
          )}

          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor={`points-${submissionId}`}>
              Points Earned (Max: {maxPoints})
            </Label>
            <Input
              id={`points-${submissionId}`}
              type="number"
              min={0}
              max={maxPoints}
              step={0.5}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder={`Enter points (0-${maxPoints})`}
            />
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <Label htmlFor={`feedback-${submissionId}`}>
              Feedback for Student
            </Label>
            <Textarea
              id={`feedback-${submissionId}`}
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Graded Info */}
          {isGraded && gradedAt && (
            <div className="text-sm text-muted-foreground">
              Last graded on {format(new Date(gradedAt), "PPp")}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || gradeMutation.isPending}
            className="w-full"
          >
            {gradeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Grade & Feedback
              </>
            )}
          </Button>

          {gradeMutation.isError && (
            <p className="text-sm text-destructive">
              Error: {(gradeMutation.error as Error).message}
            </p>
          )}

          {gradeMutation.isSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Grade saved successfully!
            </p>
          )}
        </div>

        {/* Current Feedback (if exists and graded) */}
        {isGraded && feedback && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Previous Feedback
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 whitespace-pre-wrap">
              {feedback}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EssayGrading;
