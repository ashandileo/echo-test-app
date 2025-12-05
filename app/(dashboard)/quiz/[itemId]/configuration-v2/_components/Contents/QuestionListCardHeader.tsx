import { CardDescription, CardTitle } from "@/components/ui/card";

import Add from "../Controls/Add";

const QuestionListCardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Question List (10)</CardTitle>
        <CardDescription>Questions you&apos;ve created</CardDescription>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>MC: 10</span>
          <span>•</span>
          <span>Essay: 5</span>
        </div>
        <Add />
      </div>
    </div>
  );
};

export default QuestionListCardHeader;
