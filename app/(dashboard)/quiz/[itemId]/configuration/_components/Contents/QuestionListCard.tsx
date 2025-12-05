"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import QuestionListCardHeader from "./QuestionListCardHeader";
import QuestionListCardTabs, { Tabs } from "./QuestionListCardTabs";
import Essay from "./TabsContent/Essay";
import MultipleChoice from "./TabsContent/MultipleChoice";

const QuestionListCard = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.MULTIPLE_CHOICE);

  return (
    <Card>
      <CardHeader>
        <QuestionListCardHeader />
      </CardHeader>
      <QuestionListCardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <CardContent>
        {activeTab === Tabs.MULTIPLE_CHOICE && <MultipleChoice />}
        {activeTab === Tabs.ESSAY && <Essay />}
      </CardContent>
    </Card>
  );
};

export default QuestionListCard;
