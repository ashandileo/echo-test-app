"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  QuestionDisplay,
  QuestionNavigation,
  QuizHeader,
} from "./_components/Contents";
import { NavigationButtons, TabSwitch } from "./_components/Controls";
import {
  QuizTakingProvider,
  useQuizTaking,
} from "./_components/QuizTakingContext";

const QuizTakingContent = () => {
  const { isLoading } = useQuizTaking();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardHeader>
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            <div className="border-t p-6">
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
          <Card className="w-80">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 max-w-7xl mx-auto">
      {/* Compact Header */}
      <QuizHeader />

      {/* Main Content - Flex row layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Main Quiz Card */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3 shrink-0">
            <TabSwitch />
          </CardHeader>

          <QuestionDisplay />

          <NavigationButtons />
        </Card>

        {/* Right: Question Navigation */}
        <QuestionNavigation />
      </div>
    </div>
  );
};

const QuizTakingPage = () => {
  return (
    <QuizTakingProvider>
      <QuizTakingContent />
    </QuizTakingProvider>
  );
};

export default QuizTakingPage;
