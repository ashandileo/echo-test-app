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

const AssistantChat = () => {
  const [isGeneratorOpen, toggleGeneratorOpen] = useToggle(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);

  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();

  // TODO: Replace with actual AI generation API call
  const handleGenerate = async (values: AIGeneratorFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock generated questions with variety
    const mockQuestions: GeneratedQuestion[] = [];

    // Sample questions based on type
    const mcTextQuestions = [
      {
        question: "What is the capital city of Indonesia?",
        options: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"],
        correctAnswer: 0,
        explanation:
          "Jakarta is the capital and largest city of Indonesia, located on the northwest coast of Java island.",
      },
      {
        question: "Which of the following is a prime number?",
        options: ["15", "21", "23", "27"],
        correctAnswer: 2,
        explanation:
          "23 is a prime number because it can only be divided by 1 and itself without remainder.",
      },
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language",
        ],
        correctAnswer: 0,
        explanation:
          "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
      },
    ];

    const mcListeningQuestions = [
      {
        question: "Based on the audio, what time does the train depart?",
        options: ["8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM"],
        correctAnswer: 2,
        explanation:
          "In the audio, the announcement clearly states that the train will depart at 9:30 AM from platform 3.",
      },
      {
        question: "What is the speaker's main concern in the conversation?",
        options: [
          "The weather forecast",
          "Traffic conditions",
          "Meeting schedule",
          "Restaurant reservation",
        ],
        correctAnswer: 1,
        explanation:
          "The speaker repeatedly mentions being worried about heavy traffic on the highway.",
      },
    ];

    const essayTextQuestions = [
      {
        question:
          "Explain the difference between renewable and non-renewable energy sources. Provide at least two examples of each.",
        sampleAnswer:
          "Students should explain that renewable energy sources can be naturally replenished (e.g., solar, wind, hydro), while non-renewable sources are finite (e.g., coal, oil, natural gas). Award full marks for clear explanation with correct examples.",
      },
      {
        question:
          "Describe the water cycle and explain why it is important for life on Earth.",
        sampleAnswer:
          "Students should describe evaporation, condensation, precipitation, and collection. They should mention importance for freshwater supply, climate regulation, and ecosystem support. Award points for completeness and clarity.",
      },
    ];

    const essaySpeakingQuestions = [
      {
        question:
          "Introduce yourself and talk about your hobbies for 1-2 minutes. Include what you like to do in your free time and why you enjoy these activities.",
        sampleAnswer:
          "Evaluate based on: fluency (30%), pronunciation (30%), vocabulary range (20%), and content relevance (20%). Student should speak clearly for at least 1 minute covering the required topics.",
      },
      {
        question:
          "Describe your favorite place in your city. Explain what makes it special and why people should visit it.",
        sampleAnswer:
          "Assess: coherence and organization (25%), descriptive language use (25%), pronunciation and intonation (25%), time management (25%). Minimum 1.5 minutes speaking time.",
      },
    ];

    // Generate based on selected type
    if (values.questionType === "multiple_choice") {
      const sourceQuestions =
        values.questionMode === "audio"
          ? mcListeningQuestions
          : mcTextQuestions;
      for (
        let i = 0;
        i < Math.min(values.questionCount, sourceQuestions.length);
        i++
      ) {
        mockQuestions.push({
          id: `temp-mc-${i}`,
          type: "multiple_choice",
          ...sourceQuestions[i],
          selected: true,
        });
      }
      // Fill remaining with variations
      for (let i = sourceQuestions.length; i < values.questionCount; i++) {
        const base = sourceQuestions[i % sourceQuestions.length];
        mockQuestions.push({
          id: `temp-mc-${i}`,
          type: "multiple_choice",
          question: `${base.question} (Variation ${i + 1})`,
          options: base.options,
          correctAnswer: base.correctAnswer,
          explanation: base.explanation,
          selected: true,
        });
      }
    } else if (values.questionType === "essay") {
      const sourceQuestions =
        values.answerMode === "voice"
          ? essaySpeakingQuestions
          : essayTextQuestions;
      for (
        let i = 0;
        i < Math.min(values.questionCount, sourceQuestions.length);
        i++
      ) {
        mockQuestions.push({
          id: `temp-essay-${i}`,
          type: "essay",
          ...sourceQuestions[i],
          selected: true,
        });
      }
      // Fill remaining with variations
      for (let i = sourceQuestions.length; i < values.questionCount; i++) {
        const base = sourceQuestions[i % sourceQuestions.length];
        mockQuestions.push({
          id: `temp-essay-${i}`,
          type: "essay",
          question: `${base.question} (Variation ${i + 1})`,
          sampleAnswer: base.sampleAnswer,
          selected: true,
        });
      }
    } else if (values.questionType === "mixed") {
      // Mix of all types
      const allQuestions = [
        ...mcTextQuestions.map((q) => ({
          ...q,
          type: "multiple_choice" as const,
        })),
        ...mcListeningQuestions.map((q) => ({
          ...q,
          type: "multiple_choice" as const,
        })),
        ...essayTextQuestions.map((q) => ({ ...q, type: "essay" as const })),
        ...essaySpeakingQuestions.map((q) => ({
          ...q,
          type: "essay" as const,
        })),
      ];

      for (
        let i = 0;
        i < Math.min(values.questionCount, allQuestions.length);
        i++
      ) {
        const q = allQuestions[i];
        if (q.type === "multiple_choice") {
          mockQuestions.push({
            id: `temp-mixed-${i}`,
            type: "multiple_choice",
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            selected: true,
          });
        } else {
          mockQuestions.push({
            id: `temp-mixed-${i}`,
            type: "essay",
            question: q.question,
            sampleAnswer: q.sampleAnswer,
            selected: true,
          });
        }
      }

      // Fill remaining with variations
      for (let i = allQuestions.length; i < values.questionCount; i++) {
        const base = allQuestions[i % allQuestions.length];
        if (base.type === "multiple_choice") {
          mockQuestions.push({
            id: `temp-mixed-${i}`,
            type: "multiple_choice",
            question: `${base.question} (Variation ${i + 1})`,
            options: base.options,
            correctAnswer: base.correctAnswer,
            explanation: base.explanation,
            selected: true,
          });
        } else {
          mockQuestions.push({
            id: `temp-mixed-${i}`,
            type: "essay",
            question: `${base.question} (Variation ${i + 1})`,
            sampleAnswer: base.sampleAnswer,
            selected: true,
          });
        }
      }
    }

    setGeneratedQuestions(mockQuestions);
    toggleGeneratorOpen(); // Close generator
    setIsReviewOpen(true); // Open review
  };

  // Mutation for saving questions
  const saveMutation = useMutation({
    mutationFn: async (questions: GeneratedQuestion[]) => {
      const supabase = createClient();

      // Insert multiple choice questions
      const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
      if (mcQuestions.length > 0) {
        const { error: mcError } = await supabase
          .from("quiz_question_multiple_choice")
          .insert(
            mcQuestions.map((q) => ({
              quiz_id: itemId,
              question_text: q.question,
              options: q.options || [],
              correct_answer: q.correctAnswer?.toString() || "0",
              explanation: q.explanation || null,
              question_mode: "text",
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
            essayQuestions.map((q) => ({
              quiz_id: itemId,
              question_text: q.question,
              rubric: q.sampleAnswer || null,
              answer_mode: "text",
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
    await saveMutation.mutateAsync(selectedQuestions);
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
