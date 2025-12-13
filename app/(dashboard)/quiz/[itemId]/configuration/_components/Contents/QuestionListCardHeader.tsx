import { useParams } from "next/navigation";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";

import Add from "../Controls/Add";

interface Props {
  totalCount: number;
  multipleChoiceCount: number;
  essayCount: number;
  isLoading: boolean;
}

const QuestionListCardHeader = ({
  totalCount,
  multipleChoiceCount,
  essayCount,
  isLoading,
}: Props) => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data } = useQuizDetails(itemId);

  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Question List ({isLoading ? "..." : totalCount})</CardTitle>
        <CardDescription>Questions you&apos;ve created</CardDescription>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>MC: {isLoading ? "..." : multipleChoiceCount}</span>
          <span>•</span>
          <span>Essay: {isLoading ? "..." : essayCount}</span>
        </div>
        {data?.status === "draft" && <Add />}
      </div>
    </div>
  );
};

export default QuestionListCardHeader;
