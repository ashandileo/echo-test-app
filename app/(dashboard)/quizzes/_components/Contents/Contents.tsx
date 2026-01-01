"use client";

import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
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
        <EmptyState
          icon={BookOpen}
          title="No Quizzes Available"
          description="There are no published quizzes at the moment. Please check back later for new English learning content."
        />
      )}
    </>
  );
};

export default Contents;
