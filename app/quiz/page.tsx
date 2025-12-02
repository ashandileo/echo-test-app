import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Eye, Clock, FileText } from "lucide-react";
import Link from "next/link";

// Sample data for EchoTest
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

export default function QuizPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">Quiz Management</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header with Create button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Quiz List</h2>
              <p className="text-muted-foreground">
                Manage and create quizzes for your students
              </p>
            </div>
            <Button asChild>
              <Link href="/quiz/create">
                <Plus className="mr-2 size-4" />
                Create New Quiz
              </Link>
            </Button>
          </div>

          {/* Table */}
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

          {/* Info jika tidak ada data */}
          {quizData.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <FileText className="mb-4 size-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No quizzes yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first quiz
              </p>
              <Button asChild>
                <Link href="/quiz/create">
                  <Plus className="mr-2 size-4" />
                  Create New Quiz
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
