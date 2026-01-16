"use client";
import Link from "next/link";

import startCase from "lodash/startCase";
import { Calendar, Eye, FileText, Trash2 } from "lucide-react";

import { SharedDelete } from "@/components/dialogs";
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
import { useQuizDelete, useQuizzes } from "@/lib/hooks/api/useQuiz";
import useActions from "@/lib/hooks/useAction";

import Add from "../Controls/Add";

enum Actions {
  DELETE = "DELETE",
}

type ActionMetadata = {
  id: string;
  name: string;
};

const Contents = () => {
  const { action, setAction, clearAction, isAction } = useActions<
    Actions,
    ActionMetadata
  >();

  const { data: quizzes } = useQuizzes();
  const { mutateAsync: deleteQuiz } = useQuizDelete();

  const handleDeleteClick = (quiz: { id: string; name: string }) => {
    setAction(Actions.DELETE, quiz);
  };

  const handleDeleteConfirm = async () => {
    if (action.data) {
      await deleteQuiz(action.data.id);
      clearAction();
    }
  };

  return (
    <>
      {quizzes && quizzes?.length > 0 ? (
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-semibold">
                  Quiz Name
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1.5">
                    <FileText className="size-4" />
                    Questions
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    Created
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} className="group">
                  <TableCell className="font-medium">
                    <Link
                      href={`/quiz/${quiz?.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {quiz?.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {quiz?.totalQuestions || 0}
                      </span>
                      <span className="text-sm">questions</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quiz?.status === "published" ? "default" : "secondary"
                      }
                      className={
                        quiz?.status === "published"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
                      }
                    >
                      {startCase(quiz?.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(quiz.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/quiz/${quiz?.id}`}>
                          <Eye className="size-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          handleDeleteClick({ id: quiz.id, name: quiz.name })
                        }
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No quizzes yet"
          description="Get started by creating your first quiz. Upload a document or create questions manually."
          action={<Add />}
        />
      )}

      <SharedDelete
        open={isAction(Actions.DELETE)}
        onOpenChange={clearAction}
        onConfirm={handleDeleteConfirm}
        itemName={action.data?.name}
      />
    </>
  );
};

export default Contents;
