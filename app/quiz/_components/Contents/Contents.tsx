import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Edit, Trash2, Eye, Clock, FileText } from "lucide-react";
import Link from "next/link";

const quizData = [
  {
    id: 1,
    name: "Basic Grammar",
    totalQuestions: 20,
    duration: 30, // dalam menit
    status: "Published",
    createdAt: "2025-01-15",
    totalParticipants: 45,
  },
  {
    id: 2,
    name: "Vocabulary Building",
    totalQuestions: 25,
    duration: 45,
    status: "Published",
    createdAt: "2025-01-14",
    totalParticipants: 32,
  },
  {
    id: 3,
    name: "Advanced Reading Comprehension",
    totalQuestions: 15,
    duration: 60,
    status: "Draft",
    createdAt: "2025-01-13",
    totalParticipants: 0,
  },
  {
    id: 4,
    name: "Speaking Practice",
    totalQuestions: 10,
    duration: 20,
    status: "Published",
    createdAt: "2025-01-12",
    totalParticipants: 28,
  },
  {
    id: 5,
    name: "Listening Skills",
    totalQuestions: 18,
    duration: 35,
    status: "Published",
    createdAt: "2025-01-11",
    totalParticipants: 51,
  },
];

const Contents = () => {
  return (
    <div className="rounded-md border">
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
            <TableHead>Participants</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizData.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.name}</TableCell>
              <TableCell>{quiz.totalQuestions} questions</TableCell>
              <TableCell>{quiz.duration} minutes</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    quiz.status === "Published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {quiz.status}
                </span>
              </TableCell>
              <TableCell>{quiz.totalParticipants} students</TableCell>
              <TableCell className="text-muted-foreground">
                {quiz.createdAt}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/quiz/${quiz.id}`}>
                      <Eye className="size-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/quiz/${quiz.id}/edit`}>
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
    </div>
  );
};

export default Contents;
