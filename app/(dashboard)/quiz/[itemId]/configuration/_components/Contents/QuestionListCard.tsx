"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuizQuestionCount } from "@/lib/hooks/api/useQuizQuestion";

import QuestionContentEssay from "./QuestionContentEssay";
import QuestionContentMultipleChoices from "./QuestionContentMultipleChoices";
import QuestionListCardHeader from "./QuestionListCardHeader";
import QuestionListCardTabs, { Tabs } from "./QuestionListCardTabs";

const QuestionListCard = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.MULTIPLE_CHOICE);
  const { itemId } = useParams<{ itemId: string }>();

  const { data, isLoading } = useQuizQuestionCount(itemId);

  const { multipleChoice, essay } = data || { multipleChoice: 0, essay: 0 };
  const totalCount = multipleChoice + essay;

  return (
    <Card>
      <CardHeader>
        <QuestionListCardHeader
          totalCount={totalCount}
          multipleChoiceCount={multipleChoice}
          essayCount={essay}
          isLoading={isLoading}
        />
      </CardHeader>
      <QuestionListCardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        multipleChoiceCount={multipleChoice}
        essayCount={essay}
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
