"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

import { useQuizTaking } from "../QuizTakingContext";

const NavigationButtons = () => {
  const {
    currentQuestionIndex,
    currentQuestions,
    selectedTab,
    handlePrevious,
    handleNext,
    handleSubmitQuiz,
  } = useQuizTaking();

  const isFirstQuestion =
    currentQuestionIndex === 0 && selectedTab === "multiple_choice";
  const isLastQuestion =
    currentQuestionIndex === currentQuestions.length - 1 &&
    selectedTab === "essay";
  const hasNoQuestions = currentQuestions.length === 0;

  return (
    <CardFooter className="shrink-0 flex justify-between border-t pt-4 pb-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={isFirstQuestion || hasNoQuestions}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {isLastQuestion ? (
          <Button onClick={handleSubmitQuiz} size="sm">
            Submit Quiz
          </Button>
        ) : (
          <Button size="sm" onClick={handleNext} disabled={hasNoQuestions}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </CardFooter>
  );
};

export default NavigationButtons;
