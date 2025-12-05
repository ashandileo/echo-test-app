import React from "react";

import { Plus } from "lucide-react";
import { useToggle } from "usehooks-ts";

import { Button } from "@/components/ui/button";

const Add = () => {
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  return (
    <Button onClick={toggleDialogOpen} className="gap-2">
      <Plus className="size-4" />
      Add Question
    </Button>
  );
};

export default Add;
