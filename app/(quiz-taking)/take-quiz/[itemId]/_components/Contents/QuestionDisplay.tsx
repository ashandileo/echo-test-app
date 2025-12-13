"use client";

import { CheckCircle2, FileText } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { useQuizTaking } from "../QuizTakingContext";

const QuestionDisplay = () => {
  const {
    currentQuestion,
    selectedTab,
    currentQuestions,
    answers,
    handleAnswerSelect,
  } = useQuizTaking();
  if (currentQuestions.length === 0) {
    return (
      <CardContent className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              No{" "}
              {selectedTab === "multiple_choice" ? "multiple choice" : "essay"}{" "}
              questions available
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 overflow-y-auto min-h-0">
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold">
            {currentQuestion?.question_text}
          </h3>
        </div>

        {/* Answer Options */}
        {selectedTab === "multiple_choice" ? (
          <div className="space-y-2">
            {currentQuestion &&
              "options" in currentQuestion &&
              currentQuestion?.options &&
              Object.entries(
                currentQuestion.options as Record<string, string>
              ).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === key
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {answers[currentQuestion.id] === key && (
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium mr-2">{key}.</span>
                      <span>{value as string}</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div>
            <textarea
              value={currentQuestion ? answers[currentQuestion.id] || "" : ""}
              onChange={(e) =>
                currentQuestion &&
                handleAnswerSelect(currentQuestion.id, e.target.value)
              }
              placeholder="Type your answer here..."
              className="w-full h-[calc(100vh-400px)] min-h-[200px] p-3 rounded-lg border-2 border-border focus:border-primary focus:outline-none resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {currentQuestion ? answers[currentQuestion.id]?.length || 0 : 0}{" "}
              characters
            </p>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default QuestionDisplay;
