"use client";
import { useState } from "react";

import { Sparkles } from "lucide-react";

import { QuizUploadDocument } from "@/components/dialogs/quiz/QuizUploadDocument";
import { Button } from "@/components/ui/button";

const Add = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleOpen = () => setIsDialogOpen(!isDialogOpen);

  return (
    <>
      <Button onClick={toggleOpen} size="lg" className="gap-2 shadow-md">
        <Sparkles className="size-4" />
        Create New Quiz
      </Button>
      <QuizUploadDocument open={isDialogOpen} onOpenChange={toggleOpen} />
    </>
  );
};

export default Add;
