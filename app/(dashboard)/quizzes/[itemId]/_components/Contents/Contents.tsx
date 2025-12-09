import CardInstruction from "./CardInstruction";
import CardMain from "./CardMain";

const Contents = () => {
  return (
    <div className="grid gap-6">
      <CardMain />
      <CardInstruction />
    </div>
  );
};

export default Contents;
