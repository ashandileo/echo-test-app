import React from "react";

import { Plus } from "lucide-react";
import { useToggle } from "usehooks-ts";

import QuestionAddDialog from "@/components/dialogs/quiz/QuestionAdd";
import { QuestionFormValues } from "@/components/forms/quiz/schema";
import { Button } from "@/components/ui/button";

const Add = () => {
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  const handleAddQuestion = (question: QuestionFormValues) => {
    // TODO: Implement add question logic
    console.log("Question added:", question);
  };

  return (
    <>
      <Button onClick={toggleDialogOpen} className="gap-2">
        <Plus className="size-4" />
        Add Question
      </Button>

      <QuestionAddDialog
        open={isDialogOpen}
        onOpenChange={toggleDialogOpen}
        onAddQuestion={handleAddQuestion}
      />
    </>
  );
};

export default Add;
