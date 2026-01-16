"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { FileText, Loader2, Mic, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

import { QuestionFormValues } from "./schema";

interface EssayFieldsProps {
  form: UseFormReturn<QuestionFormValues>;
  quizId?: string; // Optional quiz ID for AI generation context
}

const EssayFields = ({ form, quizId }: EssayFieldsProps) => {
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Key to force remount

  const currentQuestion = form.watch("question");
  const answerMode = form.watch("answerMode") || "text";

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

      // Force remount the editor to show new content
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error generating rubric:", error);
      // Optionally show error toast/notification here
    } finally {
      setIsGeneratingRubric(false);
    }
  };

  return (
    <>
      {/* Answer Mode Selection */}
      <Field>
        <FieldLabel>Answer Type</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => form.setValue("answerMode", "text")}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${
                  answerMode === "text"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }
              `}
            >
              <div
                className={`p-3 rounded-full ${
                  answerMode === "text"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <FileText className="size-6" />
              </div>
              <div className="text-center">
                <div
                  className={`font-semibold text-sm ${
                    answerMode === "text" ? "text-primary" : "text-foreground"
                  }`}
                >
                  Text Answer
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Students type their response
                </div>
              </div>
              {answerMode === "text" && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="size-3 text-primary-foreground"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => form.setValue("answerMode", "voice")}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${
                  answerMode === "voice"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }
              `}
            >
              <div
                className={`p-3 rounded-full ${
                  answerMode === "voice"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Mic className="size-6" />
              </div>
              <div className="text-center">
                <div
                  className={`font-semibold text-sm ${
                    answerMode === "voice" ? "text-primary" : "text-foreground"
                  }`}
                >
                  Voice Note (Speaking)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Students record audio response
                </div>
              </div>
              {answerMode === "voice" && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="size-3 text-primary-foreground"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {answerMode === "text"
              ? "Students will write their essay answer in a text field."
              : "Students will record their spoken answer - ideal for speaking tests or oral assessments."}
          </p>

          {/* Info Alert for Voice Mode */}
          {answerMode === "voice" && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900 flex gap-3">
              <div className="shrink-0">
                <svg
                  className="size-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                  Students will submit voice recordings
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  After publishing, students will record and submit audio
                  answers. Make sure to provide clear rubrics for grading spoken
                  responses.
                </p>
              </div>
            </div>
          )}
        </FieldContent>
      </Field>

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
          <MarkdownEditor
            key={editorKey}
            value={form.watch("sampleAnswer") || ""}
            onChange={(value) => form.setValue("sampleAnswer", value)}
            placeholder="Enter sample answer or grading rubric to help with assessment..."
            rows={10}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Generate with AI&quot; to create a comprehensive rubric
            with sample answer in Markdown format (Bahasa Indonesia). Includes
            grading criteria and expected content structure.
          </p>
        </FieldContent>
      </Field>
    </>
  );
};

export default EssayFields;
