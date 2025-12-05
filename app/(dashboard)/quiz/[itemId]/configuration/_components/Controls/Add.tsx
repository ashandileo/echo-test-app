import React from "react";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";

import QuestionAddDialog from "@/components/dialogs/quiz/QuestionAdd";
import { QuestionFormValues } from "@/components/forms/quiz/QuestionAddForm/schema";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const Add = () => {
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const queryClient = useQueryClient();

  const { itemId } = useParams<{ itemId: string }>();

  // Mutation for adding multiple choice questions
  const addMultipleChoiceMutation = useMutation({
    mutationFn: async (question: QuestionFormValues) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .insert({
          quiz_id: itemId,
          question_text: question.question,
          options: question.options,
          correct_answer: question.correctAnswer?.toString() || "",
          explanation: question.explanation || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Multiple choice question added successfully!");

      // Close
      toggleDialogOpen();

      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions-multiple-choice", itemId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-question-counts", itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add multiple choice question: ${error.message}`);
    },
  });

  // Mutation for adding essay questions
  const addEssayMutation = useMutation({
    mutationFn: async (question: QuestionFormValues) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_essay")
        .insert({
          quiz_id: itemId,
          question_text: question.question,
          rubric: question.sampleAnswer || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Essay question added successfully!");

      // Close dialog
      toggleDialogOpen();

      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions-essay", itemId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-question-counts", itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add essay question: ${error.message}`);
    },
  });

  const handleAddQuestion = (question: QuestionFormValues) => {
    if (question.type === "multiple_choice") {
      addMultipleChoiceMutation.mutate(question);
      return;
    }

    if (question.type === "essay") {
      addEssayMutation.mutate(question);
      return;
    }
  };

  return (
    <>
      <Button
        onClick={toggleDialogOpen}
        className="gap-2"
        disabled={
          addMultipleChoiceMutation.isPending || addEssayMutation.isPending
        }
      >
        <Plus className="size-4" />
        Add Question
      </Button>

      <QuestionAddDialog
        open={isDialogOpen}
        onAddQuestion={handleAddQuestion}
        closeDialog={toggleDialogOpen}
      />
    </>
  );
};

export default Add;
