import { CheckCircle2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const options = ["Berlin", "Madrid", "Paris", "Rome"];
const correntAnswerIndex = 2;

const MultipleChoice = () => {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">Question 1</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Multiple Choice
              </span>
              <CheckCircle2 className="size-4 text-green-500" />
            </div>

            {/* Question */}
            <p className="font-medium mb-3">
              Example Question Text: What is the capital of France?
            </p>

            {/* Options */}
            <div className="space-y-1">
              {options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`text-sm ${
                    optIndex === correntAnswerIndex
                      ? "text-green-600 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}. {opt}
                  {optIndex === correntAnswerIndex && " ✓"}
                </div>
              ))}
            </div>

            {/* Explanation */}
            <p className="text-sm text-muted-foreground mt-2 italic">
              Explanation: Paris is the capital and most populous city of
              France.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => null}
            className="shrink-0 text-red-500 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultipleChoice;
