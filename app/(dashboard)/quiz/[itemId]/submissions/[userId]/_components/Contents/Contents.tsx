"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { FileCheck, FileText } from "lucide-react";

import {
  useQuizQuestionEssay,
  useQuizQuestionMultipleChoice,
} from "@/lib/hooks/api/useQuizQuestion";
import {
  useQuizSubmissionEssay,
  useQuizSubmissionMultipleChoice,
} from "@/lib/hooks/api/useQuizSubmission";
import { useUserById } from "@/lib/hooks/api/useUser";
import { cn } from "@/lib/utils";
import { parseMultipleChoiceOptions } from "@/lib/utils/jsonb";
import { Database } from "@/types/supabase";

import EssayGrading from "./EssayGrading";
import MultipleChoiceReview from "./MultipleChoiceReview";
import SubmissionScoreSummary from "./SubmissionScoreSummary";

type MultipleChoiceQuestion =
  Database["public"]["Tables"]["quiz_question_multiple_choice"]["Row"];
type EssayQuestion = Database["public"]["Tables"]["quiz_question_essay"]["Row"];
type MCSubmission =
  Database["public"]["Tables"]["quiz_submission_multiple_choice"]["Row"];
type EssaySubmission =
  Database["public"]["Tables"]["quiz_submission_essay"]["Row"];

interface QuestionWithSubmission {
  question: MultipleChoiceQuestion | EssayQuestion;
  submission: MCSubmission | EssaySubmission | null;
  type: "multiple_choice" | "essay";
}

const Contents = () => {
  const { itemId, userId } = useParams<{ itemId: string; userId: string }>();
  const [activeTab, setActiveTab] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useUserById(userId);

  // Fetch questions
  const { data: mcQuestions, isLoading: isLoadingMCQuestions } =
    useQuizQuestionMultipleChoice(itemId);
  const { data: essayQuestions, isLoading: isLoadingEssayQuestions } =
    useQuizQuestionEssay(itemId);

  // Fetch submissions
  const { data: mcSubmissions, isLoading: isLoadingMCSubmissions } =
    useQuizSubmissionMultipleChoice(itemId, userId);
  const { data: essaySubmissions, isLoading: isLoadingEssaySubmissions } =
    useQuizSubmissionEssay(itemId, userId);

  const isLoading =
    isLoadingUser ||
    isLoadingMCQuestions ||
    isLoadingEssayQuestions ||
    isLoadingMCSubmissions ||
    isLoadingEssaySubmissions;

  // Combine questions with submissions
  const questionsWithSubmissions: QuestionWithSubmission[] = [];

  // Add MC questions
  if (mcQuestions) {
    mcQuestions.forEach((question) => {
      const submission = mcSubmissions?.find(
        (s) => s.question_id === question.id
      );
      questionsWithSubmissions.push({
        question,
        submission: submission || null,
        type: "multiple_choice",
      });
    });
  }

  // Add essay questions
  if (essayQuestions) {
    essayQuestions.forEach((question) => {
      const submission = essaySubmissions?.find(
        (s) => s.question_id === question.id
      );
      questionsWithSubmissions.push({
        question,
        submission: submission || null,
        type: "essay",
      });
    });
  }

  // Calculate scores
  const multipleChoiceTotal =
    mcQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;
  const multipleChoiceScore =
    mcSubmissions?.reduce((sum, s) => sum + s.points_earned, 0) || 0;

  const essayTotal = essayQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;
  const essayScore =
    essaySubmissions?.reduce((sum, s) => sum + (s.points_earned || 0), 0) || 0;
  const essayGraded =
    essaySubmissions?.filter((s) => s.points_earned !== null).length || 0;

  const totalScore = multipleChoiceScore + essayScore;
  const maxScore = multipleChoiceTotal + essayTotal;

  // Get student info
  const studentName = (userData?.full_name as string) || "Student";
  const studentEmail = userData?.email || userId;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SubmissionScoreSummary
          studentName="Loading..."
          studentEmail="Loading..."
          multipleChoiceScore={0}
          multipleChoiceTotal={0}
          essayScore={0}
          essayTotal={0}
          essayGraded={0}
          totalEssayQuestions={0}
          totalScore={0}
          maxScore={0}
          isLoading
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubmissionScoreSummary
        studentName={studentName}
        studentEmail={studentEmail}
        multipleChoiceScore={multipleChoiceScore}
        multipleChoiceTotal={multipleChoiceTotal}
        essayScore={essayScore}
        essayTotal={essayTotal}
        essayGraded={essayGraded}
        totalEssayQuestions={essayQuestions?.length || 0}
        totalScore={totalScore}
        maxScore={maxScore}
      />

      {/* Tabs */}
      <div className="flex border-b bg-card rounded-t-lg overflow-hidden">
        <button
          onClick={() => setActiveTab("multiple_choice")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "multiple_choice"
              ? "bg-primary text-primary-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <FileCheck className="h-4 w-4" />
          Multiple Choice
          {mcQuestions && mcQuestions.length > 0 && (
            <span
              className={cn(
                "ml-1 px-2 py-0.5 text-xs rounded-full",
                activeTab === "multiple_choice"
                  ? "bg-primary-foreground/20"
                  : "bg-muted"
              )}
            >
              {mcQuestions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("essay")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "essay"
              ? "bg-primary text-primary-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <FileText className="h-4 w-4" />
          Essay
          {essayQuestions && essayQuestions.length > 0 && (
            <span
              className={cn(
                "ml-1 px-2 py-0.5 text-xs rounded-full",
                activeTab === "essay" ? "bg-primary-foreground/20" : "bg-muted"
              )}
            >
              {essayQuestions.length}
            </span>
          )}
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {activeTab === "multiple_choice" &&
          questionsWithSubmissions
            .filter((item) => item.type === "multiple_choice")
            .map((item, index) => {
              const question = item.question as MultipleChoiceQuestion;
              const submission = item.submission as MCSubmission | null;

              if (!submission) return null;

              const options = parseMultipleChoiceOptions(question.options);

              return (
                <MultipleChoiceReview
                  key={question.id}
                  questionNumber={index + 1}
                  questionText={question.question_text}
                  options={options}
                  selectedAnswer={submission.selected_answer}
                  correctAnswer={question.correct_answer}
                  explanation={question.explanation}
                  points={question.points}
                  isCorrect={submission.is_correct}
                  questionMode={question.question_mode}
                  audioUrl={question.audio_url}
                />
              );
            })}

        {activeTab === "essay" &&
          questionsWithSubmissions
            .filter((item) => item.type === "essay")
            .map((item, index) => {
              const question = item.question as EssayQuestion;
              const submission = item.submission as EssaySubmission | null;

              if (!submission) return null;

              return (
                <EssayGrading
                  key={question.id}
                  questionNumber={index + 1}
                  questionText={question.question_text}
                  answerText={submission.answer_text || ""}
                  audioUrl={submission.audio_url}
                  answerMode={question.answer_mode as "text" | "voice"}
                  rubric={question.rubric}
                  maxPoints={question.points}
                  pointsEarned={submission.points_earned}
                  feedback={submission.feedback}
                  isGraded={submission.points_earned !== null}
                  gradedAt={submission.graded_at}
                  submissionId={submission.id}
                  quizId={itemId}
                  userId={userId}
                  studentName={studentName}
                />
              );
            })}
      </div>
    </div>
  );
};

export default Contents;
