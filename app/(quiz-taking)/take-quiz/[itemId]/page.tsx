"use client";

import { Menu } from "lucide-react";

import { QuizSubmitConfirmDialog } from "@/components/dialogs/quiz/QuizSubmitConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const {
    isLoading,
    isSubmitDialogOpen,
    setIsSubmitDialogOpen,
    handleConfirmSubmit,
    answeredCount,
    totalQuestions,
  } = useQuizTaking();

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col p-3 md:p-6 max-w-7xl mx-auto overflow-hidden">
        <div className="shrink-0 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 md:gap-4">
              <Skeleton className="h-8 md:h-9 w-20 md:w-28" />
              <div className="hidden md:block h-6 w-px bg-border" />
              <div className="flex items-center gap-2 md:gap-3">
                <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 md:h-6 w-32 md:w-48 mb-1" />
                  <Skeleton className="h-3 w-24 md:w-32" />
                </div>
              </div>
            </div>
            <Skeleton className="h-8 md:h-9 w-16 md:w-20 rounded-lg" />
          </div>
          <Skeleton className="h-2 w-full mb-1" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20 md:w-24" />
            <Skeleton className="h-3 w-20 md:w-24" />
          </div>
        </div>

        <div className="flex-1 flex gap-3 md:gap-6 min-h-0 overflow-hidden">
          <Card className="flex-1 shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="pb-3 md:pb-4 border-b bg-muted/30 shrink-0">
              <Skeleton className="h-8 md:h-9 w-full md:w-64" />
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-2 md:gap-3 flex-1">
                  <Skeleton className="h-7 w-10 md:h-8 md:w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 md:h-6 w-full mb-2" />
                    <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <Skeleton className="h-14 md:h-16 w-full rounded-xl" />
                <Skeleton className="h-14 md:h-16 w-full rounded-xl" />
                <Skeleton className="h-14 md:h-16 w-full rounded-xl" />
                <Skeleton className="h-14 md:h-16 w-full rounded-xl" />
              </div>
            </div>
            <div className="border-t p-4 md:p-6 bg-muted/30 shrink-0">
              <div className="flex justify-between items-center">
                <Skeleton className="h-9 md:h-10 w-24 md:w-32" />
                <Skeleton className="h-9 md:h-10 w-24 md:w-32" />
              </div>
            </div>
          </Card>

          <Card className="hidden lg:block w-80 shadow-lg">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </CardHeader>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col p-3 md:p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Compact Header */}
      <QuizHeader />

      {/* Main Content - Flex row layout */}
      <div className="flex-1 flex gap-3 md:gap-6 min-h-0 overflow-hidden">
        {/* Left: Main Quiz Card */}
        <Card className="flex-1 flex flex-col min-w-0 shadow-lg overflow-hidden py-0">
          <CardHeader className="pb-3 pt-3 md:pb-4 shrink-0 border-b bg-muted/30">
            <TabSwitch />
          </CardHeader>

          <QuestionDisplay />

          <NavigationButtons />
        </Card>

        {/* Right: Question Navigation - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <QuestionNavigation />
        </div>

        {/* Mobile: Question Navigation in Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-24 right-4 lg:hidden h-14 w-14 rounded-full shadow-lg z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Question Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <QuestionNavigation />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Submit Confirmation Dialog */}
      <QuizSubmitConfirmDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        onConfirm={handleConfirmSubmit}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
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
