"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { QuestionFormValues } from "./schema";

interface MultipleChoiceFieldsProps {
  form: UseFormReturn<QuestionFormValues>;
}

const MultipleChoiceFields = ({ form }: MultipleChoiceFieldsProps) => {
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const currentQuestion = form.watch("question");
  const currentOptions = form.watch("options");
  const currentCorrectAnswer = form.watch("correctAnswer");

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentOptions || ["", "", "", ""])];
    newOptions[index] = value;
    form.setValue("options", newOptions);
  };

  const handleGenerateExplanation = async () => {
    if (!currentQuestion?.trim()) {
      return;
    }

    const correctOption = currentOptions?.[currentCorrectAnswer || 0];
    if (!correctOption?.trim()) {
      return;
    }

    setIsGeneratingExplanation(true);

    // Simulate AI generation (in production, this would call an actual API)
    setTimeout(() => {
      const generatedExplanation = `The correct answer is ${String.fromCharCode(
        65 + (currentCorrectAnswer || 0)
      )}. ${correctOption}. ${currentQuestion} because ${correctOption} is the most appropriate choice based on the concepts learned. This answer demonstrates correct understanding of the material being tested.`;

      form.setValue("explanation", generatedExplanation);
      setIsGeneratingExplanation(false);
    }, 1500);
  };

  return (
    <>
      <Field>
        <FieldLabel>Answer Options</FieldLabel>
        <FieldContent>
          <div className="space-y-3">
            {(currentOptions || ["", "", "", ""]).map(
              (option: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-20">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentCorrectAnswer === index}
                      onChange={() => form.setValue("correctAnswer", index)}
                      className="size-4"
                    />
                    <Label className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}.
                    </Label>
                  </div>
                  <Input
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </div>
              )
            )}
          </div>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <div className="flex items-center justify-between w-full">
            <span>Explanation (Optional)</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateExplanation}
              disabled={
                isGeneratingExplanation ||
                !currentQuestion?.trim() ||
                !currentOptions?.[currentCorrectAnswer || 0]?.trim()
              }
              className="gap-2"
            >
              {isGeneratingExplanation ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </FieldLabel>
        <FieldContent>
          <Textarea
            placeholder="Enter explanation for the correct answer..."
            value={form.watch("explanation") || ""}
            onChange={(e) => form.setValue("explanation", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Click the &quot;Generate with AI&quot; button to create an automatic
            explanation based on the question and correct answer
          </p>
        </FieldContent>
      </Field>
    </>
  );
};

export default MultipleChoiceFields;
