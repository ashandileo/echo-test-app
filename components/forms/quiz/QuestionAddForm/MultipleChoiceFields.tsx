"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { FileText, Headphones, Loader2, Sparkles } from "lucide-react";

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
  const questionMode = form.watch("questionMode") || "text";

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
      {/* Question Mode Selection */}
      <Field>
        <FieldLabel>Question Display Mode</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => form.setValue("questionMode", "text")}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${
                  questionMode === "text"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }
              `}
            >
              <div
                className={`p-3 rounded-full ${
                  questionMode === "text"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <FileText className="size-6" />
              </div>
              <div className="text-center">
                <div
                  className={`font-semibold text-sm ${
                    questionMode === "text" ? "text-primary" : "text-foreground"
                  }`}
                >
                  Text Only
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Standard text-based question
                </div>
              </div>
              {questionMode === "text" && (
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
              onClick={() => form.setValue("questionMode", "audio")}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${
                  questionMode === "audio"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }
              `}
            >
              <div
                className={`p-3 rounded-full ${
                  questionMode === "audio"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Headphones className="size-6" />
              </div>
              <div className="text-center">
                <div
                  className={`font-semibold text-sm ${
                    questionMode === "audio"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  Audio (Listening)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Question played as audio file
                </div>
              </div>
              {questionMode === "audio" && (
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
            {questionMode === "text"
              ? "The question will be displayed as text for students to read."
              : "The question will be played as an audio file - ideal for listening comprehension tests."}
          </p>

          {/* Info Alert for Audio Mode */}
          {questionMode === "audio" && (
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900 flex gap-3">
                <div className="shrink-0">
                  <svg
                    className="size-5 text-purple-600 dark:text-purple-400"
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
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Audio will be generated when you publish the quiz
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    The <strong>Audio Script</strong> will be converted to
                    speech. Students will <strong>hear the audio</strong> but{" "}
                    <strong>read the question</strong> as text.
                  </p>
                </div>
              </div>

              {/* Example */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  � Example: Listening Comprehension
                </p>
                <div className="text-xs space-y-2">
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      🔊 Audio Script (students will hear):
                    </p>
                    <code className="block text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 p-2 rounded text-wrap">
                      First, turn on your computer. Next, open your email. Then,
                      check the message from your teacher. Finally, reply
                      politely.
                    </code>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      ❓ Question (students will read):
                    </p>
                    <code className="block text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      What should you do after opening your email?
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </FieldContent>
      </Field>

      {/* Audio Script Field - Only show when Audio mode is selected */}
      {questionMode === "audio" && (
        <Field>
          <FieldLabel>
            Audio Script <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Textarea
              {...form.register("audioScript")}
              placeholder="Enter the script that will be read aloud as audio. For example: 'First, turn on your computer. Next, open your email. Then, check the message from your teacher. Finally, reply politely.'"
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This is the content that students will <strong>hear</strong> as
              audio. The question below is what they will <strong>read</strong>{" "}
              as text.
            </p>
            {form.formState.errors.audioScript && (
              <p className="text-xs text-destructive mt-1">
                Audio script is required for listening test questions
              </p>
            )}
          </FieldContent>
        </Field>
      )}

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
