"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import QuestionAddForm from "@/components/forms/quiz/QuestionAddForm/QuestionAddForm";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/components/forms/quiz/QuestionAddForm/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QUIZ_LISTENING_TEST_COUNT,
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
  QUIZ_SPEAKING_TEST_COUNT,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";
import { parseMultipleChoiceOptions } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];
type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];

interface QuestionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: MultipleChoiceQuestion | EssayQuestion;
  questionType: "multiple_choice" | "essay";
}

const QuestionEditDialog = ({
  open,
  onOpenChange,
  question,
  questionType,
}: QuestionEditDialogProps) => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: questionType,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      sampleAnswer: "",
      explanation: "",
      questionMode: "text",
      answerMode: "text",
      audioScript: "",
    },
  });

  // Load question data when dialog opens or question changes
  useEffect(() => {
    if (question && open) {
      form.setValue("type", questionType);
      form.setValue("question", question.question_text);

      if (questionType === "multiple_choice") {
        const mcQuestion = question as MultipleChoiceQuestion;
        const parsedOptions = parseMultipleChoiceOptions(mcQuestion.options);
        form.setValue(
          "options",
          [...parsedOptions, "", "", "", ""].slice(0, 4)
        );
        form.setValue(
          "correctAnswer",
          parseInt(mcQuestion.correct_answer || "0", 10)
        );
        form.setValue("explanation", mcQuestion.explanation || "");
        form.setValue(
          "questionMode",
          (mcQuestion.question_mode as "text" | "audio") || "text"
        );
        // Set audio script value
        form.setValue("audioScript", mcQuestion.audio_script || "");
      } else {
        const essayQuestion = question as EssayQuestion;
        form.setValue("sampleAnswer", essayQuestion.rubric || "");
        form.setValue(
          "answerMode",
          (essayQuestion.answer_mode as "text" | "voice") || "text"
        );
      }
    }
  }, [question, questionType, open, form]);

  const handleSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (questionType === "multiple_choice") {
        const filteredOptions =
          values.options?.filter((opt) => opt.trim() !== "") || [];

        const { error } = await supabase
          .from("quiz_question_multiple_choice")
          .update({
            question_text: values.question,
            options: filteredOptions,
            correct_answer: values.correctAnswer?.toString() || "0",
            explanation: values.explanation || null,
            question_mode: values.questionMode || "text", // Save question mode
            audio_script: values.audioScript || null, // Save audio script
          })
          .eq("id", question.id);

        if (error) throw error;

        queryClient.invalidateQueries({
          queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
        });
        // Force immediate refetch to ensure fresh data
        await queryClient.refetchQueries({
          queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
        });
        // Invalidate listening test count in case mode changed
        queryClient.invalidateQueries({
          queryKey: QUIZ_LISTENING_TEST_COUNT(itemId),
        });
      } else {
        const { error } = await supabase
          .from("quiz_question_essay")
          .update({
            question_text: values.question,
            rubric: values.sampleAnswer || null,
            answer_mode: values.answerMode || "text", // Save answer mode
          })
          .eq("id", question.id);

        if (error) throw error;

        queryClient.invalidateQueries({
          queryKey: QUIZ_QUESTION_ESSAY(itemId),
        });
        // Force immediate refetch to ensure fresh data
        await queryClient.refetchQueries({
          queryKey: QUIZ_QUESTION_ESSAY(itemId),
        });
        // Invalidate speaking test count in case mode changed
        queryClient.invalidateQueries({
          queryKey: QUIZ_SPEAKING_TEST_COUNT(itemId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });

      toast.success("Question updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update question:", error);
      toast.error("Failed to update question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get form state for validation
  const formValues = form.watch();
  const isQuestionEmpty = !formValues.question?.trim();
  const isMultipleChoiceInvalid =
    formValues.type === "multiple_choice" &&
    formValues.options?.some((opt) => !opt?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Sticky Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b p-6 pb-4 shrink-0">
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details below
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <QuestionAddForm form={form} isEditing={true} quizId={itemId} />
        </div>

        {/* Footer */}
        <DialogFooter className="z-10 bg-background border-t p-6 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={
              isSubmitting || isQuestionEmpty || isMultipleChoiceInvalid
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditDialog;
