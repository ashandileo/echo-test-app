"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ClipboardList, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useQuizQuestionEssay,
  useQuizQuestionMultipleChoice,
} from "@/lib/hooks/api/useQuizQuestion";
import {
  useQuizSubmissionEssay,
  useQuizSubmissionMultipleChoice,
} from "@/lib/hooks/api/useQuizSubmission";
import { useQuizSubmissionStatus } from "@/lib/hooks/api/useQuizSubmissionStatus";
import { useUser } from "@/lib/hooks/api/useUser";
import { Database } from "@/types/supabase";

import EssayResultItem, { EssayResultItemSkeleton } from "./EssayResultItem";
import MultipleChoiceResultItem, {
  MultipleChoiceResultItemSkeleton,
} from "./MultipleChoiceResultItem";
import ScoreSummary from "./ScoreSummary";

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
  const { itemId } = useParams<{ itemId: string }>();

  // Get current user
  const { data: userData } = useUser();

  const userId = userData?.id;

  // Fetch submission status
  const { data: submissionStatus, isLoading: isLoadingStatus } =
    useQuizSubmissionStatus(String(userId), itemId);

  // Fetch multiple choice questions
  const { data: mcQuestions, isLoading: isLoadingMCQuestions } =
    useQuizQuestionMultipleChoice(itemId);

  // Fetch essay questions
  const { data: essayQuestions, isLoading: isLoadingEssayQuestions } =
    useQuizQuestionEssay(itemId);

  // Fetch MC submissions
  const { data: mcSubmissions, isLoading: isLoadingMCSubmissions } =
    useQuizSubmissionMultipleChoice(itemId, String(userId));

  // Fetch essay submissions
  const { data: essaySubmissions, isLoading: isLoadingEssaySubmissions } =
    useQuizSubmissionEssay(itemId, String(userId));

  const isLoading =
    isLoadingStatus ||
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

  // Calculate scores manually
  const totalQuestions = questionsWithSubmissions.length;
  const answeredQuestions = questionsWithSubmissions.filter(
    (q) => q.submission !== null
  ).length;

  const multipleChoiceTotal =
    mcQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;
  const multipleChoiceScore =
    mcSubmissions?.reduce((sum, s) => sum + s.points_earned, 0) || 0;

  const essayGraded =
    essaySubmissions?.filter((s) => s.points_earned !== null).length || 0;
  const essayScore =
    essaySubmissions?.reduce((sum, s) => sum + (s.points_earned || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ScoreSummary
          totalQuestions={0}
          answeredQuestions={0}
          multipleChoiceScore={0}
          multipleChoiceTotal={0}
          essayGraded={0}
          essayTotal={0}
          essayScore={0}
          isLoading={true}
        />
        <div className="space-y-4">
          <MultipleChoiceResultItemSkeleton />
          <EssayResultItemSkeleton />
        </div>
      </div>
    );
  }

  // Check if user has any submissions
  const hasSubmissions = answeredQuestions > 0;

  // Check if quiz is completed
  const isCompleted = submissionStatus?.status === "submitted";

  // If no submissions, show empty state
  if (!hasSubmissions) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No Results Yet"
        description="You haven't taken this quiz yet. Start the quiz to see your results here."
        action={
          <Button asChild>
            <Link href={`/take-quiz/${itemId}`}>Start Quiz</Link>
          </Button>
        }
      />
    );
  }

  // If quiz is still in progress, show in-progress state
  if (!isCompleted) {
    return (
      <EmptyState
        icon={Clock}
        title="Quiz In Progress"
        description="You haven't completed this quiz yet. Finish the quiz to see your results here."
        action={
          <Button asChild>
            <Link href={`/take-quiz/${itemId}`}>Continue Quiz</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <ScoreSummary
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        multipleChoiceScore={multipleChoiceScore}
        multipleChoiceTotal={multipleChoiceTotal}
        essayGraded={essayGraded}
        essayTotal={essayQuestions?.length || 0}
        essayScore={essayScore}
      />

      <div className="space-y-4">
        {questionsWithSubmissions.map((item, index) => {
          if (item.type === "multiple_choice") {
            const question = item.question as MultipleChoiceQuestion;
            const submission = item.submission as MCSubmission | null;

            if (!submission) return null;

            const options = Array.isArray(question.options)
              ? question.options
              : [];

            return (
              <MultipleChoiceResultItem
                key={question.id}
                questionNumber={index + 1}
                questionText={question.question_text}
                options={options as string[]}
                selectedAnswer={submission.selected_answer}
                correctAnswer={question.correct_answer}
                explanation={question.explanation}
                points={question.points}
                isCorrect={submission.is_correct}
                questionMode={question.question_mode}
                audioUrl={question.audio_url}
              />
            );
          } else {
            const question = item.question as EssayQuestion;
            const submission = item.submission as EssaySubmission | null;

            if (!submission) return null;

            return (
              <EssayResultItem
                key={question.id}
                questionNumber={index + 1}
                questionText={question.question_text}
                answerText={submission.answer_text || ""}
                audioUrl={submission.audio_url}
                answerMode={question.answer_mode as "text" | "voice"}
                points={question.points}
                pointsEarned={submission.points_earned}
                feedback={submission.feedback}
                isGraded={submission.points_earned !== null}
                gradedAt={submission.graded_at}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Contents;
