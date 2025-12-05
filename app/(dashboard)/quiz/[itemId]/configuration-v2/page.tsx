import QuestionListCard from "./_components/Contents/QuestionListCard";
import AssistantChat from "./_components/Controls/AssistantChat";

const ConfigurationPage = () => {
  return (
    <>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Quiz Questions
            </h2>
            <p className="text-muted-foreground">
              Create and manage your quiz questions with AI Assistant
            </p>
          </div>
          <AssistantChat />
        </div>
      </div>

      <div className="p-4 md:p-6">
        <QuestionListCard />
      </div>
    </>
  );
};

export default ConfigurationPage;
