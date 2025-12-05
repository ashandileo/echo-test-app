import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import startCase from "lodash/startCase";

import { Edit, Trash2, Eye, Clock, FileText } from "lucide-react";
import Link from "next/link";
import Add from "../Controls/Add";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const Contents = () => {
  const { data } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("quiz").select("*");
      if (error) throw error;
      return data;
    },
  });

  const quizzes = data ?? [];

  return (
    <div className="rounded-md border">
      {quizzes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Quiz Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <FileText className="size-4" />
                  Questions
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  Duration
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz?.name}</TableCell>
                <TableCell>{quiz?.questions?.length} questions</TableCell>
                <TableCell>{quiz?.duration} minutes</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      quiz?.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {startCase(quiz?.status)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {quiz?.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/quiz/${quiz?.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/quiz/${quiz?.id}/edit`}>
                        <Edit className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No quizzes yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first quiz
          </p>
          <Add />
        </div>
      )}
    </div>
  );
};

export default Contents;
