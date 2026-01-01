"use client";

import ReactMarkdown from "react-markdown";

import { CheckCircle2, FileText, Headphones } from "lucide-react";
import remarkGfm from "remark-gfm";

import { AudioPlayer } from "@/components/ui/audio-player";
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
  const questionMode = question.question_mode || "text";

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

              {/* Question Mode Badge */}
              {questionMode === "audio" ? (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                  <Headphones className="size-3" />
                  Listening Test
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 flex items-center gap-1">
                  <FileText className="size-3" />
                  Text
                </span>
              )}
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Audio Player for Listening Test */}
            {questionMode === "audio" && question.audio_url && (
              <div className="mb-3">
                <AudioPlayer audioUrl={question.audio_url} />
              </div>
            )}

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
              <div className="text-sm text-muted-foreground mt-3 p-3 bg-muted/30 rounded-md border border-muted">
                <p className="font-medium text-foreground mb-1.5">
                  Explanation:
                </p>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.explanation}
                  </ReactMarkdown>
                </div>
              </div>
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
