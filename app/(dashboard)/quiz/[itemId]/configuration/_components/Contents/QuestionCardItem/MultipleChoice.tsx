"use client";

import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { type MultipleChoiceOption } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

import ItemMoreMultipleChoice from "../../Controls/ItemMoreMultipleChoice";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];

export interface MultipleChoiceQuestionWithParsedOptions extends Omit<
  MultipleChoiceQuestion,
  "options"
> {
  options: MultipleChoiceOption[];
}

interface Props {
  question: MultipleChoiceQuestionWithParsedOptions;
  questionNumber: number;
}

const MultipleChoice = ({ question, questionNumber }: Props) => {
  const options = Array.isArray(question.options) ? question.options : [];
  const correctIndex = parseInt(question.correct_answer, 10);

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">
                Question {questionNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Multiple Choice
              </span>
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Options */}
            <div className="space-y-1">
              {options.length > 0 ? (
                options.map((optionText, optIndex) => (
                  <div
                    key={optIndex}
                    className={`text-sm ${
                      optIndex === correctIndex
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {optionText}
                    {optIndex === correctIndex && (
                      <CheckCircle2 className="inline-block size-3 ml-1" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No options available
                </p>
              )}
            </div>

            {/* Explanation */}
            {question.explanation && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                Explanation: {question.explanation}
              </p>
            )}
          </div>
          <ItemMoreMultipleChoice
            question={question}
            questionNumber={questionNumber}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MultipleChoice;
