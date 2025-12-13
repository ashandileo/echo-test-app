import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  QUIZ_DETAILS,
  QUIZ_DOCUMENT_LEARNING,
  QUIZZES,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";

const SUPABASE_QUIZ_TABLE = "quiz";

// Fetch list of quizzes with question counts
export const useQuizzes = (filters?: { status?: "draft" | "published" }) => {
  return useQuery({
    queryKey: QUIZZES,
    queryFn: async () => {
      const supabase = createClient();
      const query = supabase
        .from(SUPABASE_QUIZ_TABLE)
        .select(
          `
        *,
        quiz_question_multiple_choice!inner(count),
        quiz_question_essay!inner(count)
      `
        )
        .is("deleted_at", null) // Only fetch non-deleted quizzes
        .is("quiz_question_multiple_choice.deleted_at", null) // Only count non-deleted multiple choice questions
        .is("quiz_question_essay.deleted_at", null); // Only count non-deleted essay questions

      // Filter query by status
      if (filters?.status) {
        query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const quizzes =
        data?.map((quiz) => ({
          ...quiz,
          totalQuestions:
            (quiz.quiz_question_multiple_choice?.[0]?.count || 0) +
            (quiz.quiz_question_essay?.[0]?.count || 0),
        })) || [];

      return quizzes;
    },
  });
};

// Fetch details of a specific quiz by ID
export const useQuizDetails = (quizId: string) => {
  return useQuery({
    queryKey: QUIZ_DETAILS(quizId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useQuizDocumentLearning = (
  itemId: string,
  documentPath: string
) => {
  return useQuery({
    queryKey: QUIZ_DOCUMENT_LEARNING(itemId, documentPath),
    queryFn: async () => {
      if (!documentPath) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("document_learnings")
        .select("file_name, file_path, file_size, file_type")
        .eq("file_path", documentPath)
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!documentPath && !!itemId,
  });
};

// Delete a quiz by ID (soft delete)
export const useQuizDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from(SUPABASE_QUIZ_TABLE)
        .update({ deleted_at: new Date().toISOString() }) // Soft delete: set deleted_at to current timestamp
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES });
      toast.success("Quiz deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete quiz. Please try again.");
    },
  });
};

// Update quiz status
export const useQuizStatusUpdate = (itemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newStatus: "draft" | "published") => {
      const supabase = createClient();
      const { error } = await supabase
        .from("quiz")
        .update({ status: newStatus })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_DETAILS(itemId) });
      queryClient.invalidateQueries({ queryKey: QUIZZES });
      toast.success(
        `Quiz ${newStatus === "published" ? "published" : "unpublished"} successfully`
      );
    },
    onError: () => {
      toast.error("Failed to update quiz status. Please try again.");
    },
  });
};
