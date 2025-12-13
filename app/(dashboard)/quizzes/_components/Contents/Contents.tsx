"use client";

import { BookOpen } from "lucide-react";

import { useQuizzes } from "@/lib/hooks/api/useQuiz";

import QuizCard from "./QuizCard";

const Contents = () => {
  const filters = {
    status: "published" as const,
  };

  const { data: quizzes } = useQuizzes(filters);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes?.map((quiz) => {
          return <QuizCard key={quiz.id} quiz={quiz} />;
        })}
      </div>

      {quizzes?.length === 0 && (
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
