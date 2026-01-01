"use client";

import { useState } from "react";
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
  quizId?: string; // Optional quiz ID for AI generation context
}

const MultipleChoiceFields = ({ form, quizId }: MultipleChoiceFieldsProps) => {
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

    // Check if all options are filled
    const hasEmptyOptions = currentOptions?.some((opt) => !opt?.trim());
    if (hasEmptyOptions) {
      return;
    }

    setIsGeneratingExplanation(true);

    try {
      const response = await fetch("/api/quiz/generate-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: currentCorrectAnswer || 0,
          quizId: quizId, // Include quizId for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate explanation");
      }

      form.setValue("explanation", data.explanation);
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Optionally show error toast/notification here
    } finally {
      setIsGeneratingExplanation(false);
    }
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
            Click &quot;Generate with AI&quot; to create a structured
            explanation in Markdown format (Bahasa Indonesia). Supports{" "}
            <strong>bold</strong>, <em>lists</em>, and <code>`code`</code>{" "}
            formatting for better readability.
          </p>
        </FieldContent>
      </Field>
    </>
  );
};

export default MultipleChoiceFields;
