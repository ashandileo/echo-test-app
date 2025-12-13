"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  useQuizSubmissionStatus,
  useStartQuiz,
  useSubmitQuiz,
} from "@/lib/hooks/api/useQuizSubmissionStatus";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];
type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];
type Quiz = Database["public"]["Tables"]["quiz"]["Row"];

// Type for MC submission without sensitive data
type MCSubmissionSafe = {
  id: string;
  quiz_id: string;
  question_id: string;
  user_id: string;
  selected_answer: string;
  submitted_at: string | null;
};

// Type for Essay submission without sensitive data
type EssaySubmissionSafe = {
  id: string;
  quiz_id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  submitted_at: string | null;
  updated_at: string | null;
};

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

  // Submission dialog state
  isSubmitDialogOpen: boolean;
  setIsSubmitDialogOpen: (open: boolean) => void;

  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  handleAnswerSelect: (questionId: string, answer: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleTabSwitch: (tab: "multiple_choice" | "essay") => void;
  handleSubmitQuiz: () => void;
  handleConfirmSubmit: () => Promise<void>;
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
  const supabase = createClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  // React Query mutations
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();

  // Fetch submission status
  const { data: submissionStatus } = useQuizSubmissionStatus(
    userId || "",
    itemId
  );

  // Fetch user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase.auth]);

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

  // Fetch existing submissions
  const { data: mcSubmissions, refetch: refetchMcSubmissions } = useQuery<
    MCSubmissionSafe[]
  >({
    queryKey: ["quiz-mc-submissions", itemId, userId],
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_submission_multiple_choice")
        .select(
          "id, quiz_id, question_id, user_id, selected_answer, submitted_at"
        )
        .eq("quiz_id", itemId)
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: essaySubmissions, refetch: refetchEssaySubmissions } = useQuery<
    EssaySubmissionSafe[]
  >({
    queryKey: ["quiz-essay-submissions", itemId, userId],
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_submission_essay")
        .select(
          "id, quiz_id, question_id, user_id, answer_text, submitted_at, updated_at"
        )
        .eq("quiz_id", itemId)
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Load existing answers into state - compute initial answers from submissions
  const submittedAnswers = useMemo(() => {
    const loadedAnswers: Record<string, string> = {};

    // Load MC answers
    mcSubmissions?.forEach((submission) => {
      loadedAnswers[submission.question_id] = submission.selected_answer;
    });

    // Load essay answers
    essaySubmissions?.forEach((submission) => {
      loadedAnswers[submission.question_id] = submission.answer_text;
    });

    return loadedAnswers;
  }, [mcSubmissions, essaySubmissions]);

  // Merge submitted answers with user answers (user answers take precedence)
  const answers = useMemo(() => {
    return { ...submittedAnswers, ...userAnswers };
  }, [submittedAnswers, userAnswers]);

  const isLoading = isLoadingQuiz || isLoadingMC || isLoadingEssay;

  const currentQuestions =
    selectedTab === "multiple_choice"
      ? mcQuestions || []
      : essayQuestions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions =
    (mcQuestions?.length || 0) + (essayQuestions?.length || 0);

  // Initialize quiz submission status when user and quiz are loaded
  useEffect(() => {
    const initializeQuizStatus = async () => {
      if (!userId || !itemId || !quiz) return;

      // If no submission status exists, create one with status 'in_progress'
      if (!submissionStatus) {
        // Calculate max possible score
        const mcCount = mcQuestions?.length || 0;
        const essayCount = essayQuestions?.length || 0;
        // Assuming 1 point per question (adjust based on your scoring logic)
        const maxScore = mcCount + essayCount;

        try {
          await startQuizMutation.mutateAsync({
            userId,
            quizId: itemId,
            maxPossibleScore: maxScore,
          });
        } catch (error) {
          console.error("Error initializing quiz status:", error);
        }
      }
    };

    initializeQuizStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, itemId, quiz, mcQuestions, essayQuestions]);

  // Save answer to database
  const saveAnswer = async (questionId: string, answer: string) => {
    if (!userId || !itemId) return;

    try {
      // Check if this is a multiple choice or essay question
      const isMCQuestion = mcQuestions?.some((q) => q.id === questionId);

      if (isMCQuestion) {
        // Check if answer has changed from what's in the database
        const existingSubmission = mcSubmissions?.find(
          (s) => s.question_id === questionId
        );

        // Only upsert if answer is different or doesn't exist yet
        if (
          !existingSubmission ||
          existingSubmission.selected_answer !== answer
        ) {
          // Upsert multiple choice submission
          // is_correct and points_earned will be calculated by database trigger
          const { error } = await supabase
            .from("quiz_submission_multiple_choice")
            .upsert(
              {
                quiz_id: itemId,
                question_id: questionId,
                user_id: userId,
                selected_answer: answer,
                // is_correct and points_earned will be set by trigger
              },
              {
                onConflict: "user_id,question_id",
              }
            );

          if (error) {
            console.error("Error saving multiple choice answer:", error);
          } else {
            console.log("Multiple choice answer saved:", questionId);
            // Refetch submissions to update the cache
            await refetchMcSubmissions();
          }
        } else {
          console.log(
            "Multiple choice answer unchanged, skipping save:",
            questionId
          );
        }
      } else {
        // Check if essay answer has changed from what's in the database
        const existingSubmission = essaySubmissions?.find(
          (s) => s.question_id === questionId
        );

        // Only upsert if answer is different or doesn't exist yet
        if (!existingSubmission || existingSubmission.answer_text !== answer) {
          // Essay question - save the answer text
          const { error } = await supabase.from("quiz_submission_essay").upsert(
            {
              quiz_id: itemId,
              question_id: questionId,
              user_id: userId,
              answer_text: answer,
            },
            {
              onConflict: "user_id,question_id",
            }
          );

          if (error) {
            console.error("Error saving essay answer:", error);
          } else {
            console.log("Essay answer saved:", questionId);
            // Refetch submissions to update the cache
            await refetchEssaySubmissions();
          }
        } else {
          console.log("Essay answer unchanged, skipping save:", questionId);
        }
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  // Handlers
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = async () => {
    // Save current answer before moving to next question
    if (currentQuestion && answers[currentQuestion.id]) {
      await saveAnswer(currentQuestion.id, answers[currentQuestion.id]);
    }

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

  const handlePrevious = async () => {
    // Save current answer before moving to previous question
    if (currentQuestion && answers[currentQuestion.id]) {
      await saveAnswer(currentQuestion.id, answers[currentQuestion.id]);
    }

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
    // Open confirmation dialog
    setIsSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!userId || !itemId) {
      toast.error("Cannot submit quiz: User not authenticated");
      return;
    }

    try {
      // Save current answer if any
      if (currentQuestion && answers[currentQuestion.id]) {
        await saveAnswer(currentQuestion.id, answers[currentQuestion.id]);
      }

      // Submit the quiz (update status to 'submitted')
      await submitQuizMutation.mutateAsync({
        userId,
        quizId: itemId,
      });

      toast.success("Quiz submitted successfully!");

      // Close dialog
      setIsSubmitDialogOpen(false);

      // Redirect to quiz results or dashboard
      router.push(`/quizzes/${itemId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    }
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

    // Submission dialog state
    isSubmitDialogOpen,
    setIsSubmitDialogOpen,

    // Actions
    setCurrentQuestionIndex,
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    handleTabSwitch,
    handleSubmitQuiz,
    handleConfirmSubmit,
    handleExit,
  };

  return (
    <QuizTakingContext.Provider value={value}>
      {children}
    </QuizTakingContext.Provider>
  );
};
