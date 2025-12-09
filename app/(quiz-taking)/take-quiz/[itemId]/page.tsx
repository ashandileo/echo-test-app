"use client";

import { useState } from "react";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  PenLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const QuizTakingPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch quiz details
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz-details", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch multiple choice questions
  const { data: mcQuestions, isLoading: isLoadingMC } = useQuery({
    queryKey: ["quiz-mc-questions", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_multiple_choice")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch essay questions
  const { data: essayQuestions, isLoading: isLoadingEssay } = useQuery({
    queryKey: ["quiz-essay-questions", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_question_essay")
        .select("*")
        .eq("quiz_id", itemId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = isLoadingQuiz || isLoadingMC || isLoadingEssay;

  const currentQuestions =
    selectedTab === "multiple_choice"
      ? mcQuestions || []
      : essayQuestions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // At last question of current tab, switch to next tab
      if (
        selectedTab === "multiple_choice" &&
        essayQuestions &&
        essayQuestions.length > 0
      ) {
        setSelectedTab("essay");
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // At first question of essay tab, go back to last MC question
      if (selectedTab === "essay" && mcQuestions && mcQuestions.length > 0) {
        setSelectedTab("multiple_choice");
        setCurrentQuestionIndex(mcQuestions.length - 1);
      }
    }
  };

  const handleTabSwitch = (tab: "multiple_choice" | "essay") => {
    setSelectedTab(tab);
    setCurrentQuestionIndex(0);
  };

  const handleSubmitQuiz = () => {
    // TODO: Implement quiz submission
    console.log("Submitting quiz with answers:", answers);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
          <Card className="w-80">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions =
    (mcQuestions?.length || 0) + (essayQuestions?.length || 0);

  return (
    <div className="h-screen flex flex-col p-4 max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/quizzes/${itemId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <div>
            <h1 className="text-xl font-bold">{quiz?.name || "Quiz"}</h1>
            <p className="text-xs text-muted-foreground">
              {answeredCount} / {totalQuestions} answered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">45:00</span>
        </div>
      </div>

      {/* Main Content - Flex row layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Main Quiz Card */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Q {currentQuestionIndex + 1} / {currentQuestions.length}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={
                    selectedTab === "multiple_choice" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleTabSwitch("multiple_choice")}
                  disabled={!mcQuestions?.length}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  MC ({mcQuestions?.length || 0})
                </Button>
                <Button
                  variant={selectedTab === "essay" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTabSwitch("essay")}
                  disabled={!essayQuestions?.length}
                >
                  <PenLine className="h-4 w-4 mr-1" />
                  Essay ({essayQuestions?.length || 0})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto min-h-0">
            {currentQuestions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    No{" "}
                    {selectedTab === "multiple_choice"
                      ? "multiple choice"
                      : "essay"}{" "}
                    questions available
                  </p>
                </div>
              </div>
            ) : (
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
                    {currentQuestion?.options &&
                      Object.entries(
                        currentQuestion.options as Record<string, string>
                      ).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            handleAnswerSelect(currentQuestion.id, key)
                          }
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
                      value={answers[currentQuestion?.id] || ""}
                      onChange={(e) =>
                        handleAnswerSelect(currentQuestion.id, e.target.value)
                      }
                      placeholder="Type your answer here..."
                      className="w-full h-[calc(100vh-400px)] min-h-[200px] p-3 rounded-lg border-2 border-border focus:border-primary focus:outline-none resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {answers[currentQuestion?.id]?.length || 0} characters
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="shrink-0 flex justify-between border-t pt-4 pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={
                (currentQuestionIndex === 0 &&
                  selectedTab === "multiple_choice") ||
                currentQuestions.length === 0
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === currentQuestions.length - 1 &&
              selectedTab === "essay" ? (
                <Button onClick={handleSubmitQuiz} size="sm">
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={currentQuestions.length === 0}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Right: Question Navigation */}
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
      </div>
    </div>
  );
};

export default QuizTakingPage;
