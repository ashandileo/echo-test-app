"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileText,
  Headphones,
  Loader2,
  Sparkles,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { AudioPlayer } from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QUIZ_QUESTION_MULTIPLE_CHOICE } from "@/lib/queryKeys/quiz";
import { type MultipleChoiceOption } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

import ItemMoreMultipleChoice from "../../Controls/ItemMoreMultipleChoice";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];

export interface MultipleChoiceQuestionWithParsedOptions extends Omit<
  MultipleChoiceQuestion,
  "options"
> {
  options: MultipleChoiceOption[];
}

interface Props {
  question: MultipleChoiceQuestionWithParsedOptions;
  questionNumber: number;
}

const MultipleChoice = ({ question, questionNumber }: Props) => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const options = Array.isArray(question.options) ? question.options : [];
  const correctIndex = parseInt(question.correct_answer, 10);
  const questionMode = question.question_mode || "text";

  // Mutation for generating audio preview
  const generateAudioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quiz/question/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionId: question.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate audio");
      }

      return data;
    },
    onMutate: () => {
      setIsGenerating(true);
      toast.loading("Generating audio preview...", {
        id: `generate-audio-${question.id}`,
      });
    },
    onSuccess: async () => {
      toast.dismiss(`generate-audio-${question.id}`);
      toast.success("Audio generated successfully! 🎉");

      // Invalidate and refetch queries to refresh the question data immediately
      await queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
        refetchType: "active", // Force refetch active queries
      });

      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast.dismiss(`generate-audio-${question.id}`);
      toast.error("Failed to generate audio", {
        description: error.message,
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateAudio = () => {
    generateAudioMutation.mutate();
  };

  const hasAudio = questionMode === "audio" && question.audio_url;

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">
                Question {questionNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Multiple Choice
              </span>

              {/* Question Mode Badge */}
              {questionMode === "audio" ? (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                  <Headphones className="size-3" />
                  Listening Test
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 flex items-center gap-1">
                  <FileText className="size-3" />
                  Text
                </span>
              )}
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Audio Script & Generation Button for Listening Test */}
            {questionMode === "audio" && question.audio_script && (
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1.5">
                      Audio Script:
                    </p>
                    <p className="text-sm text-purple-900 dark:text-purple-300">
                      {question.audio_script}
                    </p>
                  </div>
                  {!hasAudio && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateAudio}
                      disabled={isGenerating}
                      className="shrink-0 border-purple-300 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="size-3 mr-1.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3 mr-1.5" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Audio Player for Listening Test */}
            {questionMode === "audio" && question.audio_url && (
              <div className="mb-3">
                <AudioPlayer audioUrl={question.audio_url} />
              </div>
            )}

            {/* Options */}
            <div className="space-y-1">
              {options.length > 0 ? (
                options.map((optionText, optIndex) => (
                  <div
                    key={optIndex}
                    className={`text-sm ${
                      optIndex === correctIndex
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {optionText}
                    {optIndex === correctIndex && (
                      <CheckCircle2 className="inline-block size-3 ml-1" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No options available
                </p>
              )}
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="text-sm text-muted-foreground mt-3 p-3 bg-muted/30 rounded-md border border-muted">
                <p className="font-medium text-foreground mb-1.5">
                  Explanation:
                </p>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          <ItemMoreMultipleChoice
            question={question}
            questionNumber={questionNumber}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MultipleChoice;
