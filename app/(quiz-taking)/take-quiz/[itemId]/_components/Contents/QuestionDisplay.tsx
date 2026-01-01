"use client";

import { CheckCircle2, FileText, Headphones } from "lucide-react";

import { AudioPlayer } from "@/components/ui/audio-player";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useQuizTaking } from "../QuizTakingContext";

const QuestionDisplay = () => {
  const {
    currentQuestion,
    selectedTab,
    currentQuestions,
    currentQuestionIndex,
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

  const isAnswered = currentQuestion ? !!answers[currentQuestion.id] : false;

  // Check if current question is a listening test (audio mode)
  const isListeningTest =
    selectedTab === "multiple_choice" &&
    currentQuestion &&
    "question_mode" in currentQuestion &&
    currentQuestion.question_mode === "audio";

  const audioUrl =
    isListeningTest && currentQuestion && "audio_url" in currentQuestion
      ? currentQuestion.audio_url
      : null;

  return (
    <CardContent className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6">
      <div
        className={cn(
          selectedTab === "essay"
            ? "flex flex-col h-full space-y-4 md:space-y-6"
            : "space-y-4 md:space-y-6"
        )}
      >
        {/* Question Header */}
        <div className="flex items-start justify-between gap-2 md:gap-4 shrink-0">
          <div className="flex items-start gap-2 md:gap-3 flex-1">
            <Badge
              variant="outline"
              className="shrink-0 font-semibold text-sm md:text-base px-2 md:px-3 py-0.5 md:py-1"
            >
              {currentQuestionIndex + 1}
            </Badge>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base md:text-lg font-semibold leading-relaxed">
                  {currentQuestion?.question_text}
                </h3>
                {isListeningTest && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    <Headphones className="h-3 w-3 mr-1" />
                    Listening Test
                  </Badge>
                )}
              </div>
              {currentQuestion && "points" in currentQuestion && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Worth {currentQuestion.points}{" "}
                  {currentQuestion.points === 1 ? "point" : "points"}
                </p>
              )}
            </div>
          </div>
          {isAnswered && (
            <Badge
              variant="default"
              className="shrink-0 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Answered
            </Badge>
          )}
        </div>

        {/* Audio Player for Listening Test */}
        {isListeningTest && audioUrl && (
          <AudioPlayer audioUrl={audioUrl} className="mb-2" />
        )}

        {/* Answer Options */}
        {selectedTab === "multiple_choice" ? (
          <div className="space-y-2 md:space-y-3">
            {currentQuestion &&
              "options" in currentQuestion &&
              currentQuestion?.options &&
              Object.entries(
                currentQuestion.options as Record<string, string>
              ).map(([key, value]) => {
                const isSelected = answers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                    className={cn(
                      "w-full text-left p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div
                        className={cn(
                          "shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <span className="font-semibold mr-2 text-primary">
                          {key}.
                        </span>
                        <span className="text-sm md:text-base">
                          {value as string}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[150px] md:min-h-[200px]">
              <textarea
                value={currentQuestion ? answers[currentQuestion.id] || "" : ""}
                onChange={(e) =>
                  currentQuestion &&
                  handleAnswerSelect(currentQuestion.id, e.target.value)
                }
                placeholder="Type your detailed answer here..."
                className="w-full h-full p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm md:text-base"
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <p className="text-muted-foreground">
                {currentQuestion ? answers[currentQuestion.id]?.length || 0 : 0}{" "}
                characters
              </p>
              {currentQuestion && answers[currentQuestion.id]?.length > 0 && (
                <p className="text-muted-foreground">
                  ~{Math.ceil((answers[currentQuestion.id]?.length || 0) / 5)}{" "}
                  words
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default QuestionDisplay;
