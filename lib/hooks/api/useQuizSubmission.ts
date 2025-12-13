import { useQuery } from "@tanstack/react-query";

import { QUIZ_SUBMISSION_MULTIPLE_CHOICE } from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";

// Fetch multiple choice submissions for a specific quiz and user
export const useQuizSubmissionMultipleChoice = (
  itemId: string,
  userId: string
) => {
  return useQuery({
    queryKey: QUIZ_SUBMISSION_MULTIPLE_CHOICE(itemId, userId),
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_submission_multiple_choice")
        .select("*")
        .eq("quiz_id", itemId)
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useQuizSubmissionEssay = (itemId: string, userId: string) => {
  return useQuery({
    queryKey: ["quiz-essay-submissions", itemId, userId],
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_submission_essay")
        .select("*")
        .eq("quiz_id", itemId)
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};
