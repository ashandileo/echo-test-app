"use client";

import { useParams, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import Contents from "./_components/Contents/Contents";

const SubmissionDetailPage = () => {
  const router = useRouter();
  const { itemId } = useParams<{ itemId: string }>();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/quiz/${itemId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Student Submission
            </h1>
            <p className="text-muted-foreground">
              Review and grade student answers
            </p>
          </div>
        </div>
      </div>
      <Contents />
    </div>
  );
};

export default SubmissionDetailPage;
