"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

import { SharedDelete } from "@/components/dialogs";
import QuestionEditDialog from "@/components/dialogs/quiz/QuestionEdit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";
import { type MultipleChoiceOption } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];

interface MultipleChoiceQuestionWithParsedOptions extends Omit<
  MultipleChoiceQuestion,
  "options"
> {
  options: MultipleChoiceOption[];
}

interface Props {
  question: MultipleChoiceQuestionWithParsedOptions;
  questionNumber: number;
}

const MultipleChoice = ({ question, questionNumber }: Props) => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const options = Array.isArray(question.options) ? question.options : [];
  const correctIndex = parseInt(question.correct_answer, 10);

  const handleDelete = async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("quiz_question_multiple_choice")
        .delete()
        .eq("id", question.id);

      if (error) throw error;

      // Invalidate query cache
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
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
                Multiple Choice
              </span>
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Options */}
            <div className="space-y-1">
              {options.length > 0 ? (
                options.map((optionText, optIndex) => (
                  <div
                    key={optIndex}
                    className={`text-sm ${
                      optIndex === correctIndex
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {optionText}
                    {optIndex === correctIndex && (
                      <CheckCircle2 className="inline-block size-3 ml-1" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No options available
                </p>
              )}
            </div>

            {/* Explanation */}
            {question.explanation && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                Explanation: {question.explanation}
              </p>
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
        questionType="multiple_choice"
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

export default MultipleChoice;
