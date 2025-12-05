"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

import QuestionContentEssay from "./QuestionContentEssay";
import QuestionContentMultipleChoices from "./QuestionContentMultipleChoices";
import QuestionListCardHeader from "./QuestionListCardHeader";
import QuestionListCardTabs, { Tabs } from "./QuestionListCardTabs";

const QuestionListCard = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.MULTIPLE_CHOICE);
  const { itemId } = useParams<{ itemId: string }>();

  // Fetch counts only
  const { data: counts, isLoading } = useQuery({
    queryKey: ["quiz-question-counts", itemId],
    queryFn: async () => {
      const supabase = createClient();

      const [mcResult, essayResult] = await Promise.all([
        supabase
          .from("quiz_question_multiple_choice")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", itemId),
        supabase
          .from("quiz_question_essay")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", itemId),
      ]);

      if (mcResult.error) throw mcResult.error;
      if (essayResult.error) throw essayResult.error;

      const multipleChoiceCount = mcResult.count || 0;
      const essayCount = essayResult.count || 0;

      return {
        multipleChoiceCount,
        essayCount,
        totalCount: multipleChoiceCount + essayCount,
      };
    },
    enabled: !!itemId,
  });

  return (
    <Card>
      <CardHeader>
        <QuestionListCardHeader
          totalCount={counts?.totalCount || 0}
          multipleChoiceCount={counts?.multipleChoiceCount || 0}
          essayCount={counts?.essayCount || 0}
          isLoading={isLoading}
        />
      </CardHeader>
      <QuestionListCardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        multipleChoiceCount={counts?.multipleChoiceCount || 0}
        essayCount={counts?.essayCount || 0}
        isLoading={isLoading}
      />
      <CardContent>
        {activeTab === Tabs.MULTIPLE_CHOICE && (
          <QuestionContentMultipleChoices />
        )}
        {activeTab === Tabs.ESSAY && <QuestionContentEssay />}
      </CardContent>
    </Card>
  );
};

export default QuestionListCard;
