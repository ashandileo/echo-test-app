"use client";

import { useParams } from "next/navigation";

import { AlertCircle, Headphones, Mic } from "lucide-react";

import {
  useListeningTestCount,
  useSpeakingTestCount,
} from "@/lib/hooks/api/useQuizQuestion";

const QuizPublishInfo = () => {
  const { itemId } = useParams<{ itemId: string }>();

  // Get counts of listening and speaking tests
  const { data: listeningTestCount = 0 } = useListeningTestCount(itemId);
  const { data: speakingTestCount = 0 } = useSpeakingTestCount(itemId);

  const hasSpecialTests = listeningTestCount > 0 || speakingTestCount > 0;

  if (!hasSpecialTests) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
      <div className="flex gap-3">
        <div className="shrink-0">
          <AlertCircle className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Important: Audio Generation & Publishing
          </h3>

          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            {listeningTestCount > 0 && (
              <div className="flex items-start gap-2">
                <Headphones className="size-4 mt-0.5 shrink-0" />
                <p>
                  <strong>
                    {listeningTestCount} Listening Test
                    {listeningTestCount > 1 ? "s" : ""}
                  </strong>{" "}
                  - Audio will be generated from question text when you publish
                  this quiz.
                </p>
              </div>
            )}

            {speakingTestCount > 0 && (
              <div className="flex items-start gap-2">
                <Mic className="size-4 mt-0.5 shrink-0" />
                <p>
                  <strong>
                    {speakingTestCount} Speaking Test
                    {speakingTestCount > 1 ? "s" : ""}
                  </strong>{" "}
                  - Students will submit voice recordings as answers.
                </p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="font-medium">⚠️ After Publishing:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                <li>Questions will be locked and cannot be edited</li>
                <li>Audio files will be generated for listening tests</li>
                <li>Students will be able to take the quiz</li>
              </ul>
            </div>

            <p className="mt-2 text-xs">
              💡 <strong>Tip:</strong> Review all questions carefully before
              publishing. You can add or edit questions now without any
              limitations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPublishInfo;
