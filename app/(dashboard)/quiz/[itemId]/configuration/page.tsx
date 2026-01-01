import QuestionListCard from "./_components/Contents/QuestionListCard";
import QuizPublishInfo from "./_components/QuizPublishInfo";

const ConfigurationPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <QuizPublishInfo />
      <QuestionListCard />
    </div>
  );
};

export default ConfigurationPage;
