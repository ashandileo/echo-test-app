"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  quizId: string;
}

const QuestionEditDialog = ({
  open,
  onOpenChange,
  question,
  questionType,
  quizId,
}: QuestionEditDialogProps) => {
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
      } else {
        const essayQuestion = question as EssayQuestion;
        form.setValue("sampleAnswer", essayQuestion.rubric || "");
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
          })
          .eq("id", question.id);

        if (error) throw error;

        queryClient.invalidateQueries({
          queryKey: ["quiz-questions-multiple-choice", quizId],
        });
      } else {
        const { error } = await supabase
          .from("quiz_question_essay")
          .update({
            question_text: values.question,
            rubric: values.sampleAnswer || null,
          })
          .eq("id", question.id);

        if (error) throw error;

        queryClient.invalidateQueries({
          queryKey: ["quiz-questions-essay", quizId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["quiz-question-counts", quizId],
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
          <QuestionAddForm form={form} isEditing={true} />
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
