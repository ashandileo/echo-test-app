import { Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CardInstruction = () => {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Quiz Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
            <span>
              Read each question carefully before selecting your answer
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
            <span>You can navigate between questions during the quiz</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
            <span>Make sure to submit your quiz before the time runs out</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
            <span>For essay questions, write clear and complete answers</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CardInstruction;
