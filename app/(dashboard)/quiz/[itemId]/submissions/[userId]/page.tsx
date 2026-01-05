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
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/quiz/${itemId}/submissions`)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Back to submissions
        </span>
      </div>
      <Contents />
    </div>
  );
};

export default SubmissionDetailPage;
