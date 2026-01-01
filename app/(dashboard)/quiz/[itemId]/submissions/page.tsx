"use client";

import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizSubmissions } from "@/lib/hooks/api/useQuizSubmissionStatus";

import SubmissionsTable from "../_components/Contents/SubmissionsTable";

const SubmissionsPage = () => {
  const params = useParams();
  const quizId = params.itemId as string;

  const { data: submissions, isLoading } = useQuizSubmissions(quizId);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <SubmissionsTable submissions={submissions || []} />
    </div>
  );
};

export default SubmissionsPage;
