"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useQuizTaking } from "../QuizTakingContext";

const QuestionNavigation = () => {
  const {
    currentQuestions,
    currentQuestionIndex,
    answers,
    setCurrentQuestionIndex,
  } = useQuizTaking();
  return (
    <Card className="w-80 flex flex-col shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2">
          {currentQuestions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                currentQuestionIndex === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : answers[question.id]
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border hover:border-primary/50"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigation;
