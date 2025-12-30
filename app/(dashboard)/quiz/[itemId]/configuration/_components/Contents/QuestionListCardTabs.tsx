import { Button } from "@/components/ui/button";

export enum Tabs {
  MULTIPLE_CHOICE = "multiple_choice",
  ESSAY = "essay",
}

interface Props {
  activeTab: Tabs;
  setActiveTab: (tab: Tabs) => void;
  multipleChoiceCount: number;
  essayCount: number;
  isLoading: boolean;
}

const QuestionListCardTabs = ({
  activeTab,
  setActiveTab,
  multipleChoiceCount,
  essayCount,
  isLoading,
}: Props) => {
  const listTabs = [
    {
      id: Tabs.MULTIPLE_CHOICE,
      label: "Multiple Choice",
      count: multipleChoiceCount,
    },
    {
      id: Tabs.ESSAY,
      label: "Essay",
      count: essayCount,
    },
  ];

  return (
    <div className="border-b px-6">
      <div className="flex gap-1">
        {listTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
              activeTab === tab.id
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} {!isLoading && `(${tab.count})`}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuestionListCardTabs;
