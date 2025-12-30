import { useParams } from "next/navigation";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";

import Add from "../Controls/Add";
import AssistantChat from "../Controls/AssistantChat";

interface Props {
  totalCount: number;
  isLoading: boolean;
}

const QuestionListCardHeader = ({ totalCount, isLoading }: Props) => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data } = useQuizDetails(itemId);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle className="text-xl">
          Questions {!isLoading && `(${totalCount})`}
        </CardTitle>
        <CardDescription>
          Create and manage your quiz questions with AI assistance
        </CardDescription>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <AssistantChat />
        {data?.status === "draft" && <Add />}
      </div>
    </div>
  );
};

export default QuestionListCardHeader;
