import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

const DetailsEdit = () => {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Pencil className="size-4" />
      <span className="sr-only">Edit quiz information</span>
    </Button>
  );
};

export default DetailsEdit;
