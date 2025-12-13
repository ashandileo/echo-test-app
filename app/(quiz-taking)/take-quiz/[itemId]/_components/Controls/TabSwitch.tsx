"use client";

import { FileText, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

import { useQuizTaking } from "../QuizTakingContext";

const TabSwitch = () => {
  const {
    selectedTab,
    currentQuestionIndex,
    currentQuestions,
    mcQuestions,
    essayQuestions,
    handleTabSwitch,
  } = useQuizTaking();

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-base">
        Q {currentQuestionIndex + 1} / {currentQuestions.length}
      </CardTitle>
      <div className="flex gap-2">
        <Button
          variant={selectedTab === "multiple_choice" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTabSwitch("multiple_choice")}
          disabled={!mcQuestions?.length}
        >
          <FileText className="h-4 w-4 mr-1" />
          MC ({mcQuestions?.length || 0})
        </Button>
        <Button
          variant={selectedTab === "essay" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTabSwitch("essay")}
          disabled={!essayQuestions?.length}
        >
          <PenLine className="h-4 w-4 mr-1" />
          Essay ({essayQuestions?.length || 0})
        </Button>
      </div>
    </div>
  );
};

export default TabSwitch;
