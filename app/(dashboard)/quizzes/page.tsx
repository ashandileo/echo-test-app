"use client";

import { Separator } from "@radix-ui/react-separator";
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

const mockQuizzes = [
  {
    id: "1",
    title: "English Grammar for High School",
    description:
      "Test your understanding of English grammar essentials including tenses, verb forms, and sentence patterns commonly used in high school curriculum.",
    totalQuestions: 20,
    publishedAt: "2025-12-01",
    category: "Grammar",
    isCompleted: true,
    score: 85,
    completedAt: "2025-12-07",
  },
  {
    id: "2",
    title: "Academic Vocabulary Practice",
    description:
      "Build your English vocabulary with words frequently found in textbooks, essays, and academic discussions. Perfect for improving your school assignments.",
    totalQuestions: 25,
    publishedAt: "2025-12-03",
    category: "Vocabulary",
    isCompleted: true,
    score: 92,
    completedAt: "2025-12-08",
  },
  {
    id: "3",
    title: "Reading Comprehension Skills",
    description:
      "Enhance your reading abilities with passages adapted from literature, science, and social studies. Practice analyzing texts and answering comprehension questions.",
    totalQuestions: 15,
    publishedAt: "2025-12-05",
    category: "Reading",
    isCompleted: false,
    score: null,
    completedAt: null,
  },
  {
    id: "4",
    title: "Writing & Composition Basics",
    description:
      "Learn essential writing skills including paragraph structure, essay organization, and proper punctuation. Improve your written English for school assignments.",
    totalQuestions: 18,
    publishedAt: "2025-12-06",
    category: "Writing",
    isCompleted: false,
    score: null,
    completedAt: null,
  },
  {
    id: "5",
    title: "English for Daily Communication",
    description:
      "Practice practical English for everyday situations - introducing yourself, asking questions, expressing opinions, and having casual conversations with friends.",
    totalQuestions: 22,
    publishedAt: "2025-12-08",
    category: "Speaking",
    isCompleted: true,
    score: 78,
    completedAt: "2025-12-09",
  },
  {
    id: "6",
    title: "Listening & Understanding",
    description:
      "Improve your listening skills with various audio scenarios including conversations, announcements, and short talks. Great preparation for listening tests.",
    totalQuestions: 16,
    publishedAt: "2025-12-09",
    category: "Listening",
    isCompleted: false,
    score: null,
    completedAt: null,
  },
];

export default function QuizzesPage() {
  const handleStartQuiz = (quizId: string, quizTitle: string) => {
    console.log(`Starting quiz: ${quizTitle} (${quizId})`);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Available Quizzes</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">
              English Quizzes
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Choose a quiz to test and improve your English skills
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockQuizzes.map((quiz) => {
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
                key={quiz.id}
                className={`flex flex-col hover:shadow-lg transition-all hover:-translate-y-1 duration-300 ${
                  quiz.isCompleted
                    ? "border-green-500/50 dark:border-green-400/50"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-xl flex-1 leading-tight">
                      {quiz.title}
                    </CardTitle>
                    {quiz.isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {quiz.isCompleted && quiz.score !== null ? (
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
                    {quiz.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {quiz.totalQuestions} Questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span className="text-sm">
                        For High School Students (Grade 10-12)
                      </span>
                    </div>

                    {quiz.isCompleted && quiz.score !== null && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">
                            Your Score:
                          </span>
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              quiz.score
                            )}`}
                          >
                            {quiz.score}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${
                              quiz.score >= 90
                                ? "bg-green-600 dark:bg-green-400"
                                : quiz.score >= 75
                                  ? "bg-blue-600 dark:bg-blue-400"
                                  : quiz.score >= 60
                                    ? "bg-yellow-600 dark:bg-yellow-400"
                                    : "bg-orange-600 dark:bg-orange-400"
                            }`}
                            style={{ width: `${quiz.score}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-medium text-center text-muted-foreground">
                          {getScoreBadge(quiz.score)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4 flex flex-col gap-2">
                  {quiz.isCompleted ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => handleStartQuiz(quiz.id, quiz.title)}
                      >
                        Retake Quiz
                      </Button>
                      {quiz.completedAt && (
                        <p className="text-xs text-center text-muted-foreground">
                          Completed:{" "}
                          {new Date(quiz.completedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleStartQuiz(quiz.id, quiz.title)}
                      >
                        Start Quiz
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Published:{" "}
                        {new Date(quiz.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {mockQuizzes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
            <p className="text-muted-foreground max-w-md">
              There are no published quizzes at the moment. Please check back
              later for new English learning content.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
