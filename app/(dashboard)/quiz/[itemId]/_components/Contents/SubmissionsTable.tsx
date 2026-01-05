"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/types/supabase";

type QuizSubmissionStatus =
  Database["public"]["Tables"]["quiz_submission_status"]["Row"];

interface SubmissionsTableProps {
  submissions: (QuizSubmissionStatus & {
    users: {
      id: string;
      email: string;
      raw_user_meta_data: Record<string, unknown>;
    } | null;
  })[];
}

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  const router = useRouter();

  console.log("submissions", submissions);

  // Count submissions needing grading (essays not graded)
  const needsGrading = useMemo(() => {
    return submissions.filter(
      (s) =>
        s.status === "submitted" ||
        (s.status === "completed" &&
          (s.essay_score === null || s.essay_score === 0))
    ).length;
  }, [submissions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_started":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Not Started
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-blue-600"
          >
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-600"
          >
            <AlertCircle className="h-3 w-3" />
            Needs Grading
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-700"
          >
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getUserName = (submission: (typeof submissions)[0]) => {
    return (
      (submission.users?.raw_user_meta_data?.full_name as string) ||
      submission.users?.email ||
      "Unknown User"
    );
  };

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Submissions Yet"
        description="No students have started this quiz yet. Submissions will appear here once students start taking the quiz."
      />
    );
  }

  return (
    <>
      {/* Summary Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {submissions.length} student{submissions.length > 1 ? "s" : ""}
        </span>
        <span>·</span>
        {needsGrading > 0 ? (
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            {needsGrading} need{needsGrading > 1 ? "" : "s"} grading
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            All graded
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  MC
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  Essay
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Award className="h-4 w-4" />
                  Total
                </div>
              </TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const mcPercentage = submission.multiple_choice_percentage || 0;
              const essayPercentage = submission.essay_percentage || 0;
              const totalPercentage = submission.percentage || 0;

              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{getUserName(submission)}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission.users?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(submission.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold">
                        {submission.multiple_choice_score || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mcPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold">
                        {submission.essay_score || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {essayPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold">
                        {submission.total_score || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {totalPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(submission.submitted_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(
                          `/quiz/${submission.quiz_id}/submissions/${submission.user_id}`
                        );
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default SubmissionsTable;
