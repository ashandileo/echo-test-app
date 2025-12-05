import React from "react";

import { Button } from "@/components/ui/button";

export enum Tabs {
  MULTIPLE_CHOICE = "multiple_choice",
  ESSAY = "essay",
}

const listTabs = [
  {
    id: Tabs.MULTIPLE_CHOICE,
    label: "Multiple Choice",
  },
  {
    id: Tabs.ESSAY,
    label: "Essay",
  },
];

interface Props {
  activeTab: Tabs;
  setActiveTab: (tab: Tabs) => void;
}

const QuestionListCardTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="border-b px-6">
      <div className="flex gap-1">
        {listTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} (5)
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuestionListCardTabs;
