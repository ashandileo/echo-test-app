"use client";

import React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import QuestionAddForm from "@/components/forms/quiz/QuestionAddForm";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/components/forms/quiz/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuestionAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (question: QuestionFormValues) => void;
}

const QuestionAddDialog = ({
  open,
  onOpenChange,
  onAddQuestion,
}: QuestionAddDialogProps) => {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      sampleAnswer: "",
      explanation: "",
    },
  });

  const handleSubmit = (values: QuestionFormValues) => {
    onAddQuestion(values);
    form.reset();
    onOpenChange(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  // Get form state for validation
  const formValues = form.getValues();
  const isQuestionEmpty = !formValues.question?.trim();
  const isMultipleChoiceInvalid =
    formValues.type === "multiple_choice" &&
    formValues.options?.some((opt) => !opt?.trim());

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Sticky Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b p-6 pb-4 shrink-0">
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Select question type and fill in the form below to create a new
            question
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <QuestionAddForm form={form} />
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-6 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isQuestionEmpty || isMultipleChoiceInvalid}
          >
            <Plus className="size-4" />
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionAddDialog;
