"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";

import AIQuestionGenerator from "@/components/dialogs/quiz/AIQuestionGenerator";
import AIQuestionReview, {
  GeneratedQuestion,
} from "@/components/dialogs/quiz/AIQuestionReview";
import { Button } from "@/components/ui/button";
import {
  QUIZ_LISTENING_TEST_COUNT,
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
  QUIZ_SPEAKING_TEST_COUNT,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";

interface AIGeneratorFormValues {
  questionCount: number;
  questionType: "multiple_choice" | "essay" | "mixed";
  questionMode?: "text" | "audio"; // For multiple choice (listening test)
  answerMode?: "text" | "voice"; // For essay (speaking test)
  additionalInstructions?: string;
}

interface ExtendedGeneratedQuestion extends GeneratedQuestion {
  questionMode?: "text" | "audio";
  answerMode?: "text" | "voice";
  audioScript?: string | null; // Add audio_script field
  expectedWordCount?: string; // Add expected_word_count field
}

const AssistantChat = () => {
  const [isGeneratorOpen, toggleGeneratorOpen] = useToggle(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    ExtendedGeneratedQuestion[]
  >([]);
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();

  // Generate questions using RAG
  const handleGenerate = async (values: AIGeneratorFormValues) => {
    try {
      const response = await fetch("/api/quiz/generate-ai-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: itemId,
          questionCount: values.questionCount,
          questionType: values.questionType,
          questionMode: values.questionMode,
          answerMode: values.answerMode,
          additionalInstructions: values.additionalInstructions || "",
          saveToDatabase: false, // Don't save directly, show review first
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const result = await response.json();

      // Transform to GeneratedQuestion format - match create-from-document response
      const questions: ExtendedGeneratedQuestion[] = result.data.questions.map(
        (q: {
          id: string;
          type: "multiple_choice" | "essay";
          question_text: string;
          question_mode?: "text" | "audio";
          audio_script?: string | null;
          answer_mode?: "text" | "voice";
          options?: string[];
          correct_answer?: string;
          explanation?: string;
          expected_word_count?: string;
          rubric?: string;
          points?: number;
        }) => ({
          id: q.id,
          type: q.type,
          question: q.question_text, // Map question_text to question for GeneratedQuestion interface
          questionMode: q.question_mode,
          audioScript: q.audio_script, // Store audio_script
          answerMode: q.answer_mode,
          expectedWordCount: q.expected_word_count, // Store expected_word_count
          options: q.options,
          correctAnswer:
            q.correct_answer !== undefined
              ? parseInt(q.correct_answer)
              : undefined, // Convert string to number
          explanation: q.explanation,
          sampleAnswer: q.rubric, // Use rubric as sampleAnswer
          selected: true,
        })
      );

      setGeneratedQuestions(questions);
      toggleGeneratorOpen(); // Close generator
      setIsReviewOpen(true); // Open review
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate questions. Please try again."
      );
    }
  };

  // Mutation for saving questions
  const saveMutation = useMutation({
    mutationFn: async (questions: ExtendedGeneratedQuestion[]) => {
      const supabase = createClient();

      // Get max order_number to determine starting point for new questions
      // Using MAX instead of COUNT to handle cases where questions were deleted
      const { data: mcMaxData } = await supabase
        .from("quiz_question_multiple_choice")
        .select("order_number")
        .eq("quiz_id", itemId)
        .order("order_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: essayMaxData } = await supabase
        .from("quiz_question_essay")
        .select("order_number")
        .eq("quiz_id", itemId)
        .order("order_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastMcOrderNumber = mcMaxData?.order_number || 0;
      const lastEssayOrderNumber = essayMaxData?.order_number || 0;

      // Insert multiple choice questions
      const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
      if (mcQuestions.length > 0) {
        const { error: mcError } = await supabase
          .from("quiz_question_multiple_choice")
          .insert(
            mcQuestions.map((q, index) => ({
              quiz_id: itemId,
              question_text: q.question,
              options: q.options || [],
              correct_answer: q.correctAnswer?.toString() || "0",
              explanation: q.explanation || null,
              question_mode: q.questionMode || "text",
              audio_script: q.audioScript || null,
              order_number: lastMcOrderNumber + index + 1, // Continue from last order_number
            }))
          );

        if (mcError) throw mcError;
      }

      // Insert essay questions
      const essayQuestions = questions.filter((q) => q.type === "essay");
      if (essayQuestions.length > 0) {
        const { error: essayError } = await supabase
          .from("quiz_question_essay")
          .insert(
            essayQuestions.map((q, index) => ({
              quiz_id: itemId,
              question_text: q.question,
              rubric: q.sampleAnswer || null,
              answer_mode: q.answerMode || "text",
              order_number: lastEssayOrderNumber + index + 1, // Continue from last order_number
            }))
          );

        if (essayError) throw essayError;
      }

      return questions;
    },
    onSuccess: (questions) => {
      toast.success(
        `${questions.length} question${questions.length !== 1 ? "s" : ""} added successfully!`
      );

      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_ESSAY(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_LISTENING_TEST_COUNT(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_SPEAKING_TEST_COUNT(itemId),
      });

      setIsReviewOpen(false);
      setGeneratedQuestions([]);
    },
    onError: (error) => {
      console.error("Failed to save questions:", error);
      toast.error("Failed to save questions. Please try again.");
    },
  });

  const handleSave = async (selectedQuestions: GeneratedQuestion[]) => {
    await saveMutation.mutateAsync(
      selectedQuestions as ExtendedGeneratedQuestion[]
    );
  };

  return (
    <>
      <Button onClick={toggleGeneratorOpen} className="gap-2" variant="outline">
        <Sparkles className="size-4" />
        AI Question Generator
      </Button>

      <AIQuestionGenerator
        open={isGeneratorOpen}
        onOpenChange={toggleGeneratorOpen}
        onGenerate={handleGenerate}
      />

      <AIQuestionReview
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        questions={generatedQuestions}
        onSave={handleSave}
      />
    </>
  );
};

export default AssistantChat;
