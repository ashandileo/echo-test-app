"use client";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";

import QuestionAddDialog from "@/components/dialogs/quiz/QuestionAdd";
import { QuestionFormValues } from "@/components/forms/quiz/QuestionAddForm/schema";
import { Button } from "@/components/ui/button";
import {
  QUIZ_LISTENING_TEST_COUNT,
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
  QUIZ_SPEAKING_TEST_COUNT,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";

const Add = () => {
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const queryClient = useQueryClient();

  const { itemId } = useParams<{ itemId: string }>();

  // Mutation for adding multiple choice questions
  const addMultipleChoiceMutation = useMutation({
    mutationFn: async (question: QuestionFormValues) => {
      const supabase = createClient();

      // Get the current max order_number for this quiz
      const { data: maxOrderData } = await supabase
        .from("quiz_question_multiple_choice")
        .select("order_number")
        .eq("quiz_id", itemId)
        .is("deleted_at", null)
        .order("order_number", { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

      const nextOrderNumber = (maxOrderData?.order_number ?? 0) + 1;

      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .insert({
          quiz_id: itemId,
          question_text: question.question,
          options: question.options,
          correct_answer: question.correctAnswer?.toString() || "",
          explanation: question.explanation || null,
          question_mode: question.questionMode || "text", // Save question mode
          audio_script: question.audioScript || null, // Save audio script
          order_number: nextOrderNumber, // Set order number
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
        queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });
      // Invalidate listening test count for real-time update
      queryClient.invalidateQueries({
        queryKey: QUIZ_LISTENING_TEST_COUNT(itemId),
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

      // Get the current max order_number for this quiz
      const { data: maxOrderData } = await supabase
        .from("quiz_question_essay")
        .select("order_number")
        .eq("quiz_id", itemId)
        .is("deleted_at", null)
        .order("order_number", { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

      const nextOrderNumber = (maxOrderData?.order_number ?? 0) + 1;

      const { data, error } = await supabase
        .from("quiz_question_essay")
        .insert({
          quiz_id: itemId,
          question_text: question.question,
          rubric: question.sampleAnswer || null,
          answer_mode: question.answerMode || "text", // Save answer mode
          order_number: nextOrderNumber, // Set order number
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
        queryKey: QUIZ_QUESTION_ESSAY(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });
      // Invalidate speaking test count for real-time update
      queryClient.invalidateQueries({
        queryKey: QUIZ_SPEAKING_TEST_COUNT(itemId),
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
        quizId={itemId}
      />
    </>
  );
};

export default Add;
