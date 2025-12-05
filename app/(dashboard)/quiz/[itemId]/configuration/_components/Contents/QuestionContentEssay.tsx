"use client";

import { useParams } from "next/navigation";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

import Essay from "./QuestionCardItem/Essay";

type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];

const PAGE_SIZE = 10;

const QuestionContentEssay = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["quiz-questions-essay", itemId],
      queryFn: async ({ pageParam = 0 }) => {
        const supabase = createClient();

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
          questions: (data || []) as EssayQuestion[],
          nextPage:
            data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 0,
      enabled: !!itemId,
    });

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
