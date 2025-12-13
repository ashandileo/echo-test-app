import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_QUESTION_MULTIPLE_CHOICE,
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
      };
    },
  });
};

// Fetch multiple choice questions for a specific quiz with infinite scrolling
export const useQuizQuestionMultipleChoice = (itemId: string) => {
  return useInfiniteQuery({
    queryKey: QUIZ_QUESTION_MULTIPLE_CHOICE(itemId),
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient();

      const PAGE_SIZE = 10;

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      // Parse options menggunakan Zod validator
      const parsedQuestions = (data || []).map((question) => ({
        ...question,
        options: parseMultipleChoiceOptions(question.options),
      }));

      return {
        questions: parsedQuestions,
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!itemId,
  });
};

// Fetch essay questions for a specific quiz with infinite scrolling
export const useQuizQuestionEssay = (itemId: string) => {
  return useInfiniteQuery({
    queryKey: QUIZ_QUESTION_ESSAY(itemId),
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient();

      const PAGE_SIZE = 10;

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("quiz_question_essay")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        questions: data || [],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!itemId,
  });
};
