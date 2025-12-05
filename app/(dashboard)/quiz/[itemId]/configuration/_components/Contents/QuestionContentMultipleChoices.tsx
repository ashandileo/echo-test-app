"use client";

import { useParams } from "next/navigation";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  type MultipleChoiceOption,
  parseMultipleChoiceOptions,
} from "@/lib/utils/jsonb";
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

const PAGE_SIZE = 10;

const QuestionContentMultipleChoices = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["quiz-questions-multiple-choice", itemId],
      queryFn: async ({ pageParam = 0 }) => {
        const supabase = createClient();

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
        })) as MultipleChoiceQuestionWithOptions[];

        return {
          questions: parsedQuestions,
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
        <p className="text-muted-foreground">
          No multiple choice questions yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allQuestions.map((question, index) => (
        <MultipleChoice
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

export default QuestionContentMultipleChoices;
