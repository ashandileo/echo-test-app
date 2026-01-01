"use client";

import { useParams } from "next/navigation";

import { FileText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { useQuizQuestionEssay } from "@/lib/hooks/api/useQuizQuestion";

import Essay from "./QuestionCardItem/Essay";

const QuestionContentEssay = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data: allQuestions, isLoading } = useQuizQuestionEssay(itemId);

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
        title="No Essay Questions Yet"
        description="Start by adding essay questions to this quiz."
      />
    );
  }

  return (
    <div className="space-y-4">
      {allQuestions?.map((question, index) => (
        <Essay
          key={question.id}
          question={question}
          questionNumber={index + 1}
        />
      ))}
    </div>
  );
};

export default QuestionContentEssay;
