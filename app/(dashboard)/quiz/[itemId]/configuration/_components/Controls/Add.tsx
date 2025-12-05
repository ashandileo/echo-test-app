import React from "react";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";

import QuestionAddDialog from "@/components/dialogs/quiz/QuestionAdd";
import { QuestionFormValues } from "@/components/forms/quiz/schema";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const Add = () => {
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const params = useParams();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Mutation for adding multiple choice questions
  const addMultipleChoiceMutation = useMutation({
    mutationFn: async (question: QuestionFormValues) => {
      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .insert({
          quiz_id: params.itemId as string,
          question_text: question.question,
          options: question.options,
          correct_answer: question.correctAnswer?.toString() || "",
          points: 1,
          explanation: question.explanation || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Multiple choice question added successfully!");
      toggleDialogOpen();
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", params.itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add multiple choice question: ${error.message}`);
    },
  });

  // Mutation for adding essay questions
  const addEssayMutation = useMutation({
    mutationFn: async (question: QuestionFormValues) => {
      const { data, error } = await supabase
        .from("quiz_question_essay")
        .insert({
          quiz_id: params.itemId as string,
          question_text: question.question,
          points: 1,
          rubric: question.sampleAnswer || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Essay question added successfully!");
      toggleDialogOpen();
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", params.itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add essay question: ${error.message}`);
    },
  });

  const handleAddQuestion = (question: QuestionFormValues) => {
    if (question.type === "multiple_choice") {
      addMultipleChoiceMutation.mutate(question);
    } else if (question.type === "essay") {
      addEssayMutation.mutate(question);
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
