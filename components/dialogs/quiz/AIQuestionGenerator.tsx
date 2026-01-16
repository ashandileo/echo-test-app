"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Headphones,
  List,
  Loader2,
  Mic,
  Sparkles,
  Wand2,
} from "lucide-react";
import { z } from "zod";

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
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Schema for AI generation form
const aiGeneratorSchema = z.object({
  questionCount: z.number().min(1).max(10),
  questionType: z.enum(["multiple_choice", "essay", "mixed"]),
  questionMode: z.enum(["text", "audio"]).optional(), // For multiple choice (listening test)
  answerMode: z.enum(["text", "voice"]).optional(), // For essay (speaking test)
  additionalInstructions: z.string().optional(),
});

type AIGeneratorFormValues = z.infer<typeof aiGeneratorSchema>;

interface AIQuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (values: AIGeneratorFormValues) => Promise<void>;
}

const AIQuestionGenerator = ({
  open,
  onOpenChange,
  onGenerate,
}: AIQuestionGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedType, setSelectedType] = useState<
    "multiple_choice" | "essay" | "mixed"
  >("multiple_choice");

  const form = useForm<AIGeneratorFormValues>({
    resolver: zodResolver(aiGeneratorSchema),
    defaultValues: {
      questionCount: 5,
      questionType: "multiple_choice",
      questionMode: "text", // Default: text mode for MC
      answerMode: "text", // Default: text mode for essay
      additionalInstructions: "",
    },
  });

  const handleSubmit = async (values: AIGeneratorFormValues) => {
    setIsGenerating(true);
    try {
      await onGenerate(values);
      // Modal will be closed by parent after showing review
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick action buttons for common counts
  const quickCounts = [3, 5, 10];

  // Watch form values
  const questionType = form.watch("questionType");
  const questionMode = form.watch("questionMode") || "text";
  const answerMode = form.watch("answerMode") || "text";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b p-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="size-5 text-purple-500" />
            AI Question Generator
          </DialogTitle>
          <DialogDescription>
            Generate quiz questions automatically using AI. Configure the
            settings below.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            id="ai-generator-form"
          >
            <FieldGroup className="space-y-6">
              {/* Question Type Selection */}
              <Field>
                <FieldLabel>Question Type</FieldLabel>
                <FieldContent>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Multiple Choice */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("multiple_choice");
                        form.setValue("questionType", "multiple_choice");
                        form.setValue("questionMode", "text");
                        form.setValue("answerMode", undefined);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedType === "multiple_choice"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <List className="size-5" />
                        <div className="font-medium text-xs text-center">
                          Multiple Choice
                        </div>
                      </div>
                    </button>

                    {/* Essay */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("essay");
                        form.setValue("questionType", "essay");
                        form.setValue("answerMode", "text");
                        form.setValue("questionMode", undefined);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedType === "essay"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="size-5" />
                        <div className="font-medium text-xs text-center">
                          Essay
                        </div>
                      </div>
                    </button>

                    {/* Mixed */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("mixed");
                        form.setValue("questionType", "mixed");
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedType === "mixed"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="size-5" />
                        <div className="font-medium text-xs text-center">
                          Mixed
                        </div>
                      </div>
                    </button>
                  </div>
                </FieldContent>
              </Field>

              {/* Question Mode for Multiple Choice (Text or Listening Test) */}
              {questionType === "multiple_choice" && (
                <Field>
                  <FieldLabel>Question Display Mode</FieldLabel>
                  <FieldContent>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => form.setValue("questionMode", "text")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          questionMode === "text"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-5" />
                          <div className="font-medium text-xs">
                            Text Question
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Standard text-based
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => form.setValue("questionMode", "audio")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          questionMode === "audio"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Headphones className="size-5" />
                          <div className="font-medium text-xs">
                            Listening Test
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Audio-based question
                          </div>
                        </div>
                      </button>
                    </div>
                  </FieldContent>
                </Field>
              )}

              {/* Answer Mode for Essay (Text or Speaking Test) */}
              {questionType === "essay" && (
                <Field>
                  <FieldLabel>Answer Type</FieldLabel>
                  <FieldContent>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => form.setValue("answerMode", "text")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          answerMode === "text"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-5" />
                          <div className="font-medium text-xs">Text Answer</div>
                          <div className="text-xs text-muted-foreground text-center">
                            Students type response
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => form.setValue("answerMode", "voice")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          answerMode === "voice"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Mic className="size-5" />
                          <div className="font-medium text-xs">
                            Speaking Test
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Voice recording answer
                          </div>
                        </div>
                      </button>
                    </div>
                  </FieldContent>
                </Field>
              )}

              {/* Question Count */}
              <Field>
                <FieldLabel>Number of Questions</FieldLabel>
                <FieldContent className="space-y-3">
                  {/* Quick Actions */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Quick Select
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {quickCounts.map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            setSelectedCount(count);
                            form.setValue("questionCount", count);
                          }}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            selectedCount === count
                              ? "border-purple-500 bg-purple-500 text-white"
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Generate between 1-10 questions at once
                  </p>
                </FieldContent>
              </Field>

              {/* Additional Instructions */}
              <Field>
                <FieldLabel>
                  Additional Instructions{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    {...form.register("additionalInstructions")}
                    placeholder="e.g., Focus on Chapter 3, make questions about grammar, include real-world examples, difficulty: medium..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Provide specific instructions to customize the generated
                    questions. The AI will use this to create more relevant
                    questions.
                  </p>
                </FieldContent>
              </Field>

              {/* Info Box */}
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex gap-2 sm:gap-3">
                  <Sparkles className="size-4 sm:size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300">
                      AI-Powered Generation
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      The AI will analyze your quiz context and generate
                      relevant questions based on your specifications.
                      You&apos;ll be able to review and edit them before adding
                      to your quiz.
                    </p>
                  </div>
                </div>
              </div>
            </FieldGroup>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-6 pt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="ai-generator-form"
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Questions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuestionGenerator;
