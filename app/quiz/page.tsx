"use client";

import Contents from "./_components/Contents/Contents";
import Add from "./_components/Controls/Add";

export default function QuizPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quiz List</h2>
          <p className="text-muted-foreground">
            Manage and create quizzes for your students
          </p>
        </div>
        <Add />
      </div>
      <Contents />
    </div>
  );
}
