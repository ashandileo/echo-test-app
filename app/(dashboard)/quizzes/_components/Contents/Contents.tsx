"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import QuizCard from "./QuizCard";

const PAGE_SIZE = 10;

const Contents = () => {
  const { data } = useInfiniteQuery({
    queryKey: ["quizzes"],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient();

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("quiz_enriched_view")
        .select("*")
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const allQuizzes = data?.pages.flatMap((page) => page.data) || [];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allQuizzes.map((quiz) => {
          return <QuizCard key={quiz.id} quiz={quiz} />;
        })}
      </div>

      {allQuizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
          <p className="text-muted-foreground max-w-md">
            There are no published quizzes at the moment. Please check back
            later for new English learning content.
          </p>
        </div>
      )}
    </>
  );
};

export default Contents;
