"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, Edit2, Loader2, Save, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type for generated questions
export interface GeneratedQuestion {
  id: string;
  type: "multiple_choice" | "essay";
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  sampleAnswer?: string;
  selected: boolean; // Whether this question will be added
}

interface AIQuestionReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: GeneratedQuestion[];
  onSave: (selectedQuestions: GeneratedQuestion[]) => Promise<void>;
  onEdit?: (question: GeneratedQuestion) => void;
}

const AIQuestionReview = ({
  open,
  onOpenChange,
  questions,
  onSave,
  onEdit,
}: AIQuestionReviewProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  // Update selectedQuestions when questions prop changes
  useEffect(() => {
    if (questions.length > 0) {
      setSelectedQuestions(questions.map((q) => ({ ...q, selected: true })));
    }
  }, [questions]);

  const toggleSelection = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toSave = selectedQuestions.filter((q) => q.selected);
      await onSave(toSave);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save questions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = selectedQuestions.filter((q) => q.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1600px] w-[98vw] h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="bg-background border-b p-4 sm:p-6 pb-3 sm:pb-4 shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Review Generated Questions
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Review and select the questions you want to add to your quiz. You
            can deselect questions you don&apos;t want to include.
          </DialogDescription>
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm">
            <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium text-xs sm:text-sm">
              {selectedCount} of {questions.length} selected
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 sm:px-6 py-3 sm:py-4">
            <div className="space-y-3 sm:space-y-4 pr-4">
              {selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    question.selected
                      ? "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Selection Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelection(question.id)}
                      className="mt-0.5 sm:mt-1 shrink-0"
                    >
                      {question.selected ? (
                        <CheckCircle2 className="size-5 sm:size-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <XCircle className="size-5 sm:size-6 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold">
                            Question {index + 1}
                          </span>
                          <span
                            className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                              question.type === "multiple_choice"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            }`}
                          >
                            {question.type === "multiple_choice"
                              ? "Multiple Choice"
                              : "Essay"}
                          </span>
                        </div>

                        {/* Edit Button */}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(question)}
                            className="shrink-0 h-7 sm:h-8 px-2 sm:px-3"
                          >
                            <Edit2 className="size-3 sm:size-4" />
                          </Button>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                        {question.question}
                      </p>

                      {/* Multiple Choice Options */}
                      {question.type === "multiple_choice" &&
                        question.options && (
                          <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`flex items-center gap-2 p-1.5 sm:p-2 rounded text-xs sm:text-sm ${
                                  question.correctAnswer === optIndex
                                    ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800"
                                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <span className="font-medium text-xs min-w-4 sm:min-w-6">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className="text-xs sm:text-sm">
                                  {option}
                                </span>
                                {question.correctAnswer === optIndex && (
                                  <CheckCircle2 className="size-3 sm:size-4 text-green-600 dark:text-green-400 ml-auto shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Explanation/Sample Answer */}
                      {question.explanation && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            Explanation:
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            {question.explanation}
                          </p>
                        </div>
                      )}

                      {question.sampleAnswer && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-900">
                          <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">
                            Sample Answer Rubric:
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-400">
                            {question.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="bg-background border-t p-4 sm:p-6 pt-3 sm:pt-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {selectedCount === 0
                ? "Select at least one question to save"
                : `${selectedCount} question${selectedCount !== 1 ? "s" : ""} will be added`}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || selectedCount === 0}
                className="gap-2 w-full sm:w-auto order-1 sm:order-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Add {selectedCount} Question{selectedCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuestionReview;
