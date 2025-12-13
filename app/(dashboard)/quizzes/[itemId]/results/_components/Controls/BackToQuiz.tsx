"use client";

import { useParams, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

const BackToQuiz = () => {
  const router = useRouter();
  const { itemId } = useParams<{ itemId: string }>();

  const handleBack = () => {
    router.push(`/quizzes/${itemId}`);
  };

  return (
    <Button variant="outline" onClick={handleBack}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Quiz
    </Button>
  );
};

export default BackToQuiz;
