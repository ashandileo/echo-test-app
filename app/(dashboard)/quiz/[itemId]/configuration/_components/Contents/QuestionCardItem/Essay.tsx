"use client";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/types/supabase";

import ItemMoreEssay from "../../Controls/ItemMoreEssay";

export type EssayQuestion =
  Database["public"]["Tables"]["quiz_question_essay"]["Row"];

interface Props {
  question: EssayQuestion;
  questionNumber: number;
}

const Essay = ({ question, questionNumber }: Props) => {
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
                Essay
              </span>
            </div>

            {/* Question */}
            <p className="font-medium mb-3">{question.question_text}</p>

            {/* Type Info */}
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Type: Essay
              </p>
              <p className="text-sm">Students will answer in essay format</p>
            </div>

            {/* Rubric */}
            {question.rubric && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Sample Answer / Rubric:
                </p>
                <div className="markdown-content text-blue-900 dark:text-blue-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.rubric}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          <ItemMoreEssay question={question} questionNumber={questionNumber} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Essay;
