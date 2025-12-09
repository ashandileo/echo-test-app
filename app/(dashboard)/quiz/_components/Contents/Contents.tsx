"use client";
import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import startCase from "lodash/startCase";
import { Eye, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SharedDelete } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useActions from "@/lib/hooks/useAction";
import { createClient } from "@/lib/supabase/client";

import Add from "../Controls/Add";

enum Actions {
  DELETE = "DELETE",
}

type ActionMetadata = {
  id: string;
  name: string;
};

const Contents = () => {
  const { action, setAction, clearAction, isAction } = useActions<
    Actions,
    ActionMetadata
  >();

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz")
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
      if (error) throw error;

      // Calculate total questions for each quiz
      return (
        data?.map((quiz) => ({
          ...quiz,
          totalQuestions:
            (quiz.quiz_question_multiple_choice?.[0]?.count || 0) +
            (quiz.quiz_question_essay?.[0]?.count || 0),
        })) || []
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const supabase = createClient();
      // Soft delete: set deleted_at to current timestamp
      const { error } = await supabase
        .from("quiz")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz. Please try again.");
    },
  });

  const handleDeleteClick = (quiz: { id: string; name: string }) => {
    setAction(Actions.DELETE, quiz);
  };

  const handleDeleteConfirm = async () => {
    if (action.data) {
      await deleteMutation.mutateAsync(action.data.id);
      clearAction();
    }
  };

  const quizzes = data ?? [];

  return (
    <div className="rounded-md border">
      {quizzes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Quiz Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <FileText className="size-4" />
                  Questions
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz?.name}</TableCell>
                <TableCell>{quiz?.totalQuestions || 0} questions</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      quiz?.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {startCase(quiz?.status)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(quiz.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/quiz/${quiz?.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteClick({ id: quiz.id, name: quiz.name })
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No quizzes yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first quiz
          </p>
          <Add />
        </div>
      )}

      <SharedDelete
        open={isAction(Actions.DELETE)}
        onOpenChange={clearAction}
        onConfirm={handleDeleteConfirm}
        itemName={action.data?.name}
      />
    </div>
  );
};

export default Contents;
