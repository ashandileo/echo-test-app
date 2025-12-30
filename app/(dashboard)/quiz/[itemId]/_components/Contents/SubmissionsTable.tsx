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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>No Submissions Yet</CardTitle>
          <CardDescription>
            No students have started this quiz yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Submissions will appear here once students start taking the quiz.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submissions ({submissions.length})
            </CardTitle>
            <CardDescription>
              View and manage student quiz submissions
            </CardDescription>
          </div>
          {needsGrading > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {needsGrading} Need{needsGrading > 1 ? "" : "s"} Grading
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    MC Score
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-4 w-4" />
                    Essay Score
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-4 w-4" />
                    Total Score
                  </div>
                </TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
                const mcPercentage = submission.multiple_choice_percentage || 0;
                const essayPercentage = submission.essay_percentage || 0;
                const totalPercentage = submission.percentage || 0;

                // Check if this submission needs essay grading
                // A submission needs grading if it's submitted but not completed
                const needsEssayGrading = submission.status === "submitted";

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
                        {needsEssayGrading && (
                          <Badge
                            variant="outline"
                            className="text-xs border-orange-600 text-orange-600"
                          >
                            Essay grading required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {submission.multiple_choice_score || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {mcPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {submission.essay_score || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {essayPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">
                          {submission.total_score || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalPercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          of {submission.max_possible_score || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
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
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionsTable;
