"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";

import { FileText, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import EssayFields from "./EssayFields";
import MultipleChoiceFields from "./MultipleChoiceFields";
import { QuestionFormValues } from "./schema";

interface QuestionAddFormProps {
  form: UseFormReturn<QuestionFormValues>;
  isEditing?: boolean;
}

const QuestionAddForm = ({ form, isEditing = false }: QuestionAddFormProps) => {
  const questionType = form.watch("type");
  const currentQuestion = form.watch("question");

  const handleQuestionTypeChange = (type: "multiple_choice" | "essay") => {
    form.setValue("type", type);
    // Reset form when changing question type
    if (type === "multiple_choice") {
      form.setValue("options", ["", "", "", ""]);
      form.setValue("correctAnswer", 0);
      form.setValue("sampleAnswer", "");
    } else {
      form.setValue("options", undefined);
      form.setValue("correctAnswer", undefined);
    }
    form.setValue("explanation", "");
  };

  return (
    <FieldGroup>
      {/* Select Question Type - Hidden when editing */}
      {!isEditing && (
        <Field>
          <FieldLabel>Question Type</FieldLabel>
          <FieldContent>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  questionType === "multiple_choice" ? "default" : "outline"
                }
                onClick={() => handleQuestionTypeChange("multiple_choice")}
                className="flex-1"
              >
                <List className="size-4" />
                Multiple Choice
              </Button>
              <Button
                type="button"
                variant={questionType === "essay" ? "default" : "outline"}
                onClick={() => handleQuestionTypeChange("essay")}
                className="flex-1"
              >
                <FileText className="size-4" />
                Essay
              </Button>
            </div>
          </FieldContent>
        </Field>
      )}

      {/* Question */}
      <Field>
        <FieldLabel>Question</FieldLabel>
        <FieldContent>
          <Textarea
            placeholder="Enter the question..."
            value={currentQuestion || ""}
            onChange={(e) => form.setValue("question", e.target.value)}
            rows={4}
          />
        </FieldContent>
      </Field>

      {/* Form for Multiple Choice */}
      {questionType === "multiple_choice" && (
        <MultipleChoiceFields form={form} />
      )}

      {/* Form for Essay */}
      {questionType === "essay" && <EssayFields form={form} />}
    </FieldGroup>
  );
};

export default QuestionAddForm;
