"use client";
import { useRouter } from "next/navigation";

import { Award, CheckCircle2, FileText, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/types/supabase";

interface Props {
  quiz: Database["public"]["Views"]["quiz_enriched_view"]["Row"];
}

const QuizCard = ({ quiz }: Props) => {
  const router = useRouter();

  const {
    title,
    description,
    is_completed: isCompleted,
    id: quizId,
    published_at: publishedAt,
    completed_at: completedAt,
    score,
    total_questions: totalQuestions,
  } = quiz ?? {};

  const quizScore = score ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 75) return "Good Job!";
    if (score >= 60) return "Keep Practicing";
    return "Need Improvement";
  };

  return (
    <Card
      className={`flex flex-col hover:shadow-lg transition-all hover:-translate-y-1 duration-300 ${
        isCompleted ? "border-green-500/50 dark:border-green-400/50" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <CardTitle className="text-xl flex-1 leading-tight">
            {title}
          </CardTitle>
          {isCompleted && (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          )}
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Trophy className="h-3 w-3" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Sparkles className="h-3 w-3" />
              Available
            </span>
          )}
        </div>
        <CardDescription className="mt-2 line-clamp-3 text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium">{totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span className="text-sm">
              For High School Students (Grade 10-12)
            </span>
          </div>

          {isCompleted && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Your Score:
                </span>
                <span
                  className={`text-2xl font-bold ${getScoreColor(quizScore)}`}
                >
                  {score}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    quizScore >= 90
                      ? "bg-green-600 dark:bg-green-400"
                      : quizScore >= 75
                        ? "bg-blue-600 dark:bg-blue-400"
                        : quizScore >= 60
                          ? "bg-yellow-600 dark:bg-yellow-400"
                          : "bg-orange-600 dark:bg-orange-400"
                  }`}
                  style={{ width: `${quizScore}%` }}
                ></div>
              </div>
              <p className="text-xs font-medium text-center text-muted-foreground">
                {getScoreBadge(quizScore)}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex flex-col gap-2">
        {isCompleted ? (
          <>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => router.push(`/quizzes/${quizId}`)}
            >
              Retake Quiz
            </Button>
            {completedAt && (
              <p className="text-xs text-center text-muted-foreground">
                Completed:{" "}
                {new Date(completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </>
        ) : (
          <>
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push(`/quizzes/${quizId}`)}
            >
              Start Quiz
            </Button>
            {publishedAt && (
              <p className="text-xs text-center text-muted-foreground">
                Published:{" "}
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
