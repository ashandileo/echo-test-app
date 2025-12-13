"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];
type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];
type Quiz = Database["public"]["Tables"]["quiz"]["Row"];

interface QuizTakingContextValue {
  // Quiz data
  quiz: Quiz | undefined;
  mcQuestions: MultipleChoiceQuestion[] | undefined;
  essayQuestions: EssayQuestion[] | undefined;
  isLoading: boolean;

  // Current state
  currentQuestionIndex: number;
  selectedTab: "multiple_choice" | "essay";
  answers: Record<string, string>;
  currentQuestions: (MultipleChoiceQuestion | EssayQuestion)[];
  currentQuestion: MultipleChoiceQuestion | EssayQuestion | undefined;

  // Computed values
  answeredCount: number;
  totalQuestions: number;

  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  handleAnswerSelect: (questionId: string, answer: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleTabSwitch: (tab: "multiple_choice" | "essay") => void;
  handleSubmitQuiz: () => void;
  handleExit: () => void;
}

const QuizTakingContext = createContext<QuizTakingContextValue | undefined>(
  undefined
);

export const useQuizTaking = () => {
  const context = useContext(QuizTakingContext);
  if (!context) {
    throw new Error("useQuizTaking must be used within QuizTakingProvider");
  }
  return context;
};

interface QuizTakingProviderProps {
  children: ReactNode;
}

export const QuizTakingProvider = ({ children }: QuizTakingProviderProps) => {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch quiz details
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz-details", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch multiple choice questions
  const { data: mcQuestions, isLoading: isLoadingMC } = useQuery({
    queryKey: ["quiz-mc-questions", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch essay questions
  const { data: essayQuestions, isLoading: isLoadingEssay } = useQuery({
    queryKey: ["quiz-essay-questions", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_essay")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = isLoadingQuiz || isLoadingMC || isLoadingEssay;

  const currentQuestions =
    selectedTab === "multiple_choice"
      ? mcQuestions || []
      : essayQuestions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions =
    (mcQuestions?.length || 0) + (essayQuestions?.length || 0);

  // Handlers
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // At last question of current tab, switch to next tab
      if (
        selectedTab === "multiple_choice" &&
        essayQuestions &&
        essayQuestions.length > 0
      ) {
        setSelectedTab("essay");
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // At first question of essay tab, go back to last MC question
      if (selectedTab === "essay" && mcQuestions && mcQuestions.length > 0) {
        setSelectedTab("multiple_choice");
        setCurrentQuestionIndex(mcQuestions.length - 1);
      }
    }
  };

  const handleTabSwitch = (tab: "multiple_choice" | "essay") => {
    setSelectedTab(tab);
    setCurrentQuestionIndex(0);
  };

  const handleSubmitQuiz = () => {
    // TODO: Implement quiz submission
    console.log("Submitting quiz with answers:", answers);
  };

  const handleExit = () => {
    router.push(`/quizzes/${itemId}`);
  };

  const value: QuizTakingContextValue = {
    // Quiz data
    quiz,
    mcQuestions,
    essayQuestions,
    isLoading,

    // Current state
    currentQuestionIndex,
    selectedTab,
    answers,
    currentQuestions,
    currentQuestion,

    // Computed values
    answeredCount,
    totalQuestions,

    // Actions
    setCurrentQuestionIndex,
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    handleTabSwitch,
    handleSubmitQuiz,
    handleExit,
  };

  return (
    <QuizTakingContext.Provider value={value}>
      {children}
    </QuizTakingContext.Provider>
  );
};
