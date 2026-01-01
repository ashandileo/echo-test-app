"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { QuestionFormValues } from "./schema";

interface EssayFieldsProps {
  form: UseFormReturn<QuestionFormValues>;
  quizId?: string; // Optional quiz ID for AI generation context
}

const EssayFields = ({ form, quizId }: EssayFieldsProps) => {
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);

  const currentQuestion = form.watch("question");

  const handleGenerateRubric = async () => {
    if (!currentQuestion?.trim()) {
      return;
    }

    setIsGeneratingRubric(true);

    try {
      const response = await fetch("/api/quiz/generate-rubric", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          quizId: quizId, // Include quizId for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate rubric");
      }

      form.setValue("sampleAnswer", data.rubric);
    } catch (error) {
      console.error("Error generating rubric:", error);
      // Optionally show error toast/notification here
    } finally {
      setIsGeneratingRubric(false);
    }
  };

  return (
    <Field>
      <FieldLabel>
        <div className="flex items-center justify-between w-full">
          <span>Sample Answer / Rubric (Optional)</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateRubric}
            disabled={isGeneratingRubric || !currentQuestion?.trim()}
            className="gap-2"
          >
            {isGeneratingRubric ? (
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
          placeholder="Enter sample answer or grading rubric to help with assessment..."
          value={form.watch("sampleAnswer") || ""}
          onChange={(e) => form.setValue("sampleAnswer", e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Click &quot;Generate with AI&quot; to create a comprehensive rubric
          with sample answer in Markdown format (Bahasa Indonesia). Includes
          grading criteria and expected content structure.
        </p>
      </FieldContent>
    </Field>
  );
};

export default EssayFields;
