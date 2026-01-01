import { useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import { SharedDelete } from "@/components/dialogs";
import QuestionEditDialog from "@/components/dialogs/quiz/QuestionEdit";
import { Button } from "@/components/ui/button";
import { useQuizDetails } from "@/lib/hooks/api/useQuiz";
import useActions from "@/lib/hooks/useAction";
import {
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTION_ESSAY,
  QUIZ_SPEAKING_TEST_COUNT,
} from "@/lib/queryKeys/quiz";
import { createClient } from "@/lib/supabase/client";

import { EssayQuestion } from "../Contents/QuestionCardItem/Essay";

enum Actions {
  EDIT = "edit",
  DELETE = "delete",
}

interface Props {
  question: EssayQuestion;
  questionNumber: number;
}

const ItemMoreEssay = ({ question, questionNumber }: Props) => {
  const queryClient = useQueryClient();
  const { itemId } = useParams<{ itemId: string }>();
  const { isAction, setAction, clearAction } = useActions<Actions>();

  const { data } = useQuizDetails(itemId);
  const status = data?.status;

  const handleDelete = async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("quiz_question_essay")
        .delete()
        .eq("id", question.id);

      if (error) throw error;

      // Invalidate query cache
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_ESSAY(itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUESTION_COUNT(itemId),
      });
      // Invalidate speaking test count in case deleted question was voice mode
      queryClient.invalidateQueries({
        queryKey: QUIZ_SPEAKING_TEST_COUNT(itemId),
      });
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  if (status === "published") return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setAction(Actions.EDIT)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAction(Actions.DELETE)}
          className="shrink-0 text-red-500 hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <QuestionEditDialog
        open={isAction(Actions.EDIT)}
        onOpenChange={clearAction}
        question={question}
        questionType="essay"
      />

      {/* Delete Dialog */}
      <SharedDelete
        open={isAction(Actions.DELETE)}
        onOpenChange={clearAction}
        onConfirm={handleDelete}
        itemName={`Question ${questionNumber}`}
      />
    </>
  );
};

export default ItemMoreEssay;
