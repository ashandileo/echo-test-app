"use client";

import Details from "./_components/Contents/Details";
import LearningDocument from "./_components/Contents/LearningDocument";

export default function QuizInformationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Details />
      <LearningDocument />
    </div>
  );
}
