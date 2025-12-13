import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUIZ_SUBMISSION_STATUS } from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type QuizSubmissionStatus =
  Database["public"]["Tables"]["quiz_submission_status"]["Row"];
type QuizSubmissionStatusInsert =
  Database["public"]["Tables"]["quiz_submission_status"]["Insert"];
type QuizSubmissionStatusUpdate =
  Database["public"]["Tables"]["quiz_submission_status"]["Update"];

// Fetch submission status for a specific user and quiz
export const useQuizSubmissionStatus = (userId: string, quizId: string) => {
  return useQuery({
    queryKey: QUIZ_SUBMISSION_STATUS(userId, quizId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_submission_status")
        .select("*")
        .eq("user_id", userId)
        .eq("quiz_id", quizId)
        .maybeSingle();

      if (error) throw error;
      return data as QuizSubmissionStatus | null;
    },
    enabled: !!userId && !!quizId,
  });
};

// Fetch all submission statuses for a quiz (for teachers/admins)
export const useQuizSubmissions = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz", quizId, "submissions"],
    queryFn: async () => {
      const supabase = createClient();

      // Fetch submission statuses with user profile data using explicit join
      const { data: submissions, error: submissionsError } = await supabase
        .from("quiz_submission_status")
        .select(
          `
          *,
          profiles!quiz_submission_status_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `
        )
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: false });

      if (submissionsError) {
        throw submissionsError;
      }

      if (!submissions || submissions.length === 0) {
        return [];
      }

      // Map to expected format
      const result = submissions.map((submission) => ({
        ...submission,
        users: submission.profiles
          ? {
              id: submission.profiles.id,
              email: submission.profiles.email || "",
              raw_user_meta_data: {
                full_name: submission.profiles.full_name,
                avatar_url: submission.profiles.avatar_url,
              },
            }
          : null,
      })) as (QuizSubmissionStatus & {
        users: {
          id: string;
          email: string;
          raw_user_meta_data: Record<string, unknown>;
        } | null;
      })[];

      return result;
    },
    enabled: !!quizId,
  });
};

// Create or update submission status
export const useUpsertQuizSubmissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuizSubmissionStatusInsert) => {
      const supabase = createClient();
      const { data: result, error } = await supabase
        .from("quiz_submission_status")
        .upsert(data, {
          onConflict: "user_id,quiz_id",
        })
        .select()
        .single();

      if (error) throw error;
      return result as QuizSubmissionStatus;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_SUBMISSION_STATUS(data.user_id, data.quiz_id),
      });
    },
  });
};

// Update submission status
export const useUpdateQuizSubmissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: QuizSubmissionStatusUpdate;
    }) => {
      const supabase = createClient();
      const { data: result, error } = await supabase
        .from("quiz_submission_status")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result as QuizSubmissionStatus;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUIZ_SUBMISSION_STATUS(data.user_id, data.quiz_id),
      });
    },
  });
};

// Start quiz (set status to in_progress)
export const useStartQuiz = () => {
  const upsertMutation = useUpsertQuizSubmissionStatus();

  return useMutation({
    mutationFn: async ({
      userId,
      quizId,
      maxPossibleScore,
    }: {
      userId: string;
      quizId: string;
      maxPossibleScore: number;
    }) => {
      return upsertMutation.mutateAsync({
        user_id: userId,
        quiz_id: quizId,
        status: "in_progress",
        started_at: new Date().toISOString(),
        max_possible_score: maxPossibleScore,
      });
    },
  });
};

// Submit quiz (set status to submitted and calculate scores)
export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      quizId,
    }: {
      userId: string;
      quizId: string;
    }) => {
      const supabase = createClient();

      // Calculate multiple choice score
      const { data: mcSubmissions } = await supabase
        .from("quiz_submission_multiple_choice")
        .select("points_earned")
        .eq("quiz_id", quizId)
        .eq("user_id", userId);

      const mcScore =
        mcSubmissions?.reduce(
          (sum, submission) => sum + (submission.points_earned || 0),
          0
        ) || 0;

      // Calculate essay score (for already graded essays)
      const { data: essaySubmissions } = await supabase
        .from("quiz_submission_essay")
        .select("points_earned")
        .eq("quiz_id", quizId)
        .eq("user_id", userId);

      const essayScore =
        essaySubmissions?.reduce(
          (sum, submission) => sum + (submission.points_earned || 0),
          0
        ) || 0;

      const totalScore = mcScore + essayScore;

      // Check if all essays are graded
      const totalEssays = essaySubmissions?.length || 0;
      const gradedEssays =
        essaySubmissions?.filter((e) => e.points_earned !== null).length || 0;
      const allEssaysGraded = totalEssays > 0 && totalEssays === gradedEssays;

      // Determine final status
      const finalStatus = allEssaysGraded ? "completed" : "submitted";

      // Update status to submitted (or completed if all essays graded)
      const { data: result, error } = await supabase
        .from("quiz_submission_status")
        .update({
          status: finalStatus,
          submitted_at: new Date().toISOString(),
          multiple_choice_score: mcScore,
          essay_score: essayScore,
          total_score: totalScore,
          completed_at: allEssaysGraded ? new Date().toISOString() : undefined,
        })
        .eq("user_id", userId)
        .eq("quiz_id", quizId)
        .select()
        .single();

      if (error) throw error;
      return result as QuizSubmissionStatus;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUIZ_SUBMISSION_STATUS(data.user_id, data.quiz_id),
      });
    },
  });
};
