"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import { SharedDelete } from "@/components/dialogs";
import QuestionEditDialog from "@/components/dialogs/quiz/QuestionEdit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QUIZ_QUESTION_COUNT, QUIZ_QUESTION_ESSAY } from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];

interface Props {
  question: EssayQuestion;
  questionNumber: number;
}

const Essay = ({ question, questionNumber }: Props) => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("quiz_question_essay")
        .delete()
        .eq("id", question.id);

      if (error) throw error;

      // Invalidate query cache
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_ESSAY(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">
                Question {questionNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Essay
              </span>
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Type Info */}
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Type: Essay
              </p>
              <p className="text-sm">Students will answer in essay format</p>
            </div>

            {/* Rubric */}
            {question.rubric && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Sample Answer / Rubric:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-300 whitespace-pre-wrap">
                  {question.rubric}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="shrink-0 text-red-500 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <QuestionEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        question={question}
        questionType="essay"
        quizId={itemId}
      />

      {/* Delete Dialog */}
      <SharedDelete
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={`Question ${questionNumber}`}
      />
    </Card>
  );
};

export default Essay;
