"use client";

import { CheckCircle2, Headphones, XCircle } from "lucide-react";

import { AudioPlayer } from "@/components/ui/audio-player";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MultipleChoiceResultItemProps {
  questionNumber: number;
  questionText: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string | null;
  points: number;
  isCorrect: boolean;
  questionMode?: string;
  audioUrl?: string | null;
}

const MultipleChoiceResultItem = ({
  questionNumber,
  questionText,
  options,
  selectedAnswer,
  correctAnswer,
  explanation,
  points,
  isCorrect,
  questionMode,
  audioUrl,
}: MultipleChoiceResultItemProps) => {
  const isListeningTest = questionMode === "audio";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                Question {questionNumber}
              </CardTitle>
              {isListeningTest && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  <Headphones className="h-3 w-3 mr-1" />
                  Listening Test
                </Badge>
              )}
            </div>
            <CardDescription className="mt-2 text-base text-foreground">
              {questionText}
            </CardDescription>

            {/* Audio Player for Listening Test */}
            {isListeningTest && audioUrl && (
              <div className="mt-3">
                <AudioPlayer audioUrl={audioUrl} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isCorrect ? "default" : "destructive"}>
              {isCorrect ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isCorrect ? points : 0}/{points} points
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = index.toString() === selectedAnswer;
            const isCorrectOption = index.toString() === correctAnswer;

            let bgColor = "";
            let borderColor = "border-border";
            let textColor = "";

            if (isCorrectOption) {
              bgColor = "bg-green-50 dark:bg-green-950/20";
              borderColor = "border-green-500";
              textColor = "text-green-700 dark:text-green-400";
            } else if (isSelected && !isCorrect) {
              bgColor = "bg-red-50 dark:bg-red-950/20";
              borderColor = "border-red-500";
              textColor = "text-red-700 dark:text-red-400";
            }

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 ${borderColor} ${bgColor} ${textColor} transition-colors`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>{" "}
                    {option}
                  </div>
                  {isCorrectOption && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500"
                    >
                      Correct Answer
                    </Badge>
                  )}
                  {isSelected && !isCorrect && (
                    <Badge
                      variant="outline"
                      className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500"
                    >
                      Your Answer
                    </Badge>
                  )}
                  {isSelected && isCorrect && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500"
                    >
                      Your Answer
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {explanation && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Explanation
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MultipleChoiceResultItemSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceResultItem;
