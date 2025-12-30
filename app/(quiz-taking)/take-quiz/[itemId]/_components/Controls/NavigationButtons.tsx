"use client";

import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

import { useQuizTaking } from "../QuizTakingContext";

const NavigationButtons = () => {
  const {
    currentQuestionIndex,
    currentQuestions,
    selectedTab,
    answers,
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

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = currentQuestions.length;

  return (
    <CardFooter className="shrink-0 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 border-t pt-4 md:pt-6 pb-3 md:pb-4 px-4 md:px-6 bg-muted/30">
      <Button
        variant="outline"
        size="default"
        onClick={handlePrevious}
        disabled={isFirstQuestion || hasNoQuestions}
        className="w-full md:w-auto md:min-w-[120px]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
        {isLastQuestion && (
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            <span className="font-semibold text-foreground">
              {totalAnswered}
            </span>
            {" / "}
            <span>{totalQuestions}</span> answered
          </div>
        )}

        {isLastQuestion ? (
          <Button
            onClick={handleSubmitQuiz}
            size="default"
            className="w-full md:w-auto md:min-w-[140px] bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Quiz
          </Button>
        ) : (
          <Button
            size="default"
            onClick={handleNext}
            disabled={hasNoQuestions}
            className="w-full md:w-auto md:min-w-[120px]"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </CardFooter>
  );
};

export default NavigationButtons;
