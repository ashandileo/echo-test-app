"use client";

import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useQuizQuestionEssay } from "@/lib/hooks/api/useQuizQuestion";

import Essay from "./QuestionCardItem/Essay";

const QuestionContentEssay = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useQuizQuestionEssay(itemId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  const allQuestions = data?.pages.flatMap((page) => page.questions) || [];

  if (allQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No essay questions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allQuestions.map((question, index) => (
        <Essay
          key={question.id}
          question={question}
          questionNumber={index + 1}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionContentEssay;
