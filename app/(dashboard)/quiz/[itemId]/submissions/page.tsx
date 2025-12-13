"use client";

import { useMemo, useState } from "react";

import { useParams } from "next/navigation";

import { BookOpen, Filter } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizSubmissions } from "@/lib/hooks/api/useQuizSubmissionStatus";

import SubmissionsTable from "../_components/Contents/SubmissionsTable";
import StatusFilter from "../_components/Controls/StatusFilter";
import UserFilter from "../_components/Controls/UserFilter";

const SubmissionsPage = () => {
  const params = useParams();
  const quizId = params.itemId as string;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: submissions, isLoading } = useQuizSubmissions(quizId);

  // Extract unique users for filter
  const users = useMemo(() => {
    if (!submissions) return [];
    return submissions
      .filter((s) => s.users)
      .map((s) => {
        const fullName = s.users?.raw_user_meta_data?.full_name;
        const name =
          typeof fullName === "string" ? fullName : s.users?.email || "Unknown";

        return {
          id: s.user_id,
          name,
          email: s.users?.email || "",
        };
      })
      .filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];

    let filtered = submissions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (userFilter !== "all") {
      filtered = filtered.filter((s) => s.user_id === userFilter);
    }

    return filtered;
  }, [submissions, statusFilter, userFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Quiz Submissions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and grade student submissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter submissions by status or student name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <UserFilter
              value={userFilter}
              onChange={setUserFilter}
              users={users}
            />
          </div>
        </CardContent>
      </Card>

      <SubmissionsTable submissions={filteredSubmissions} />
    </div>
  );
};

export default SubmissionsPage;
