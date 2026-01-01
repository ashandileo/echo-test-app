import { useQuery } from "@tanstack/react-query";

import {
  QUIZ_LISTENING_TEST_COUNT,
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
  QUIZ_SPEAKING_TEST_COUNT,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";
import { parseMultipleChoiceOptions } from "@/lib/utils/jsonb";

// Fetch counts of different question types for a specific quiz
export const useQuizQuestionCount = (itemId: string) => {
  return useQuery({
    queryKey: QUIZ_QUESTION_COUNT(itemId),
    queryFn: async () => {
      const supabase = createClient();
      const { count: countMultipleChoice } = await supabase
        .from("quiz_question_multiple_choice")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("quiz_id", itemId);

      const { count: countEssay } = await supabase
        .from("quiz_question_essay")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("quiz_id", itemId);

      return {
        multipleChoice: countMultipleChoice ?? 0,
        essay: countEssay ?? 0,
        total: (countMultipleChoice ?? 0) + (countEssay ?? 0),
      };
    },
  });
};

// Fetch multiple choice questions for a specific quiz with infinite scrolling
export const useQuizQuestionMultipleChoice = (itemId: string) => {
  return useQuery({
    queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .select("*")
        .eq("quiz_id", itemId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Parse options from JSONB to array
      const parsedQuestions = (data || []).map((question) => ({
        ...question,
        options: parseMultipleChoiceOptions(question.options),
      }));

      return parsedQuestions;
    },
    enabled: !!itemId,
  });
};

// Fetch essay questions for a specific quiz with infinite scrolling
export const useQuizQuestionEssay = (itemId: string) => {
  return useQuery({
    queryKey: QUIZ_QUESTION_ESSAY(itemId),
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("quiz_question_essay")
        .select("*")
        .eq("quiz_id", itemId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data;
    },
    enabled: !!itemId,
  });
};

// Count listening test questions (question_mode = 'audio')
export const useListeningTestCount = (itemId: string) => {
  return useQuery({
    queryKey: QUIZ_LISTENING_TEST_COUNT(itemId),
    queryFn: async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("quiz_question_multiple_choice")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("quiz_id", itemId)
        .eq("question_mode", "audio")
        .is("deleted_at", null);

      return count ?? 0;
    },
    enabled: !!itemId,
  });
};

// Count speaking test questions (answer_mode = 'voice')
export const useSpeakingTestCount = (itemId: string) => {
  return useQuery({
    queryKey: QUIZ_SPEAKING_TEST_COUNT(itemId),
    queryFn: async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("quiz_question_essay")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("quiz_id", itemId)
        .eq("answer_mode", "voice")
        .is("deleted_at", null);

      return count ?? 0;
    },
    enabled: !!itemId,
  });
};
