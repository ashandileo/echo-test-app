"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import QuizDetailsForm from "@/components/forms/quiz/QuizDetailsForm/QuizDetailsForm";
import { type QuizDetailsFormValues } from "@/components/forms/quiz/QuizDetailsForm/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface QuizEditDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  defaultValues?: QuizDetailsFormValues;
}

const QuizEditDetails = ({
  open,
  onOpenChange,
  quizId,
  defaultValues,
}: QuizEditDetailsProps) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: QuizDetailsFormValues) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("quiz")
        .update({
          name: data.name,
          description: data.description,
        })
        .eq("id", quizId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-details", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz details updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to update quiz:", error);
      toast.error("Failed to update quiz. Please try again.");
    },
  });

  const handleSubmit = async (data: QuizDetailsFormValues) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[525px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Quiz Details</DialogTitle>
          <DialogDescription>
            Update the basic information about your quiz.
          </DialogDescription>
        </DialogHeader>
        <QuizDetailsForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuizEditDetails;
