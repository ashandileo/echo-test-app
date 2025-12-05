import { useState } from "react";

import { Plus } from "lucide-react";

import { QuizUploadDocument } from "@/components/dialogs/quiz/QuizUploadDocument";
import { Button } from "@/components/ui/button";

const Add = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleOpen = () => setIsDialogOpen(!isDialogOpen);

  return (
    <>
      <Button onClick={toggleOpen}>
        <Plus className="mr-2 size-4" />
        Create New Quiz
      </Button>
      <QuizUploadDocument open={isDialogOpen} onOpenChange={toggleOpen} />
    </>
  );
};

export default Add;
