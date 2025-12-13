"use client";

import Contents from "./_components/Contents/Contents";
import BackToQuiz from "./_components/Controls/BackToQuiz";

const ResultsPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz Results</h1>
          <p className="text-muted-foreground">
            Review your answers and performance
          </p>
        </div>
        <BackToQuiz />
      </div>
      <Contents />
    </div>
  );
};

export default ResultsPage;
