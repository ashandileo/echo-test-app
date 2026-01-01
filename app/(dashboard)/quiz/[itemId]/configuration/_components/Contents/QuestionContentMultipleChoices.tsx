"use client";

import { useParams } from "next/navigation";

import { FileText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { useQuizQuestionMultipleChoice } from "@/lib/hooks/api/useQuizQuestion";
import { type MultipleChoiceOption } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

import MultipleChoice from "./QuestionCardItem/MultipleChoice";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];

export interface MultipleChoiceQuestionWithOptions extends Omit<
  MultipleChoiceQuestion,
  "options"
> {
  options: MultipleChoiceOption[];
}

const QuestionContentMultipleChoices = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data: allQuestions, isLoading } =
    useQuizQuestionMultipleChoice(itemId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (allQuestions?.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Multiple Choice Questions Yet"
        description="Start by adding multiple choice questions to this quiz."
      />
    );
  }

  return (
    <div className="space-y-4">
      {allQuestions?.map((question, index) => (
        <MultipleChoice
          key={question.id}
          question={question}
          questionNumber={index + 1}
        />
      ))}
    </div>
  );
};

export default QuestionContentMultipleChoices;
