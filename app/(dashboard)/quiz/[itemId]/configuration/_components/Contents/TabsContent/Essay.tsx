import { CheckCircle2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Essay = () => {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">Question 1</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Essay
              </span>
              <CheckCircle2 className="size-4 text-green-500" />
            </div>

            {/* Question */}
            <p className="font-medium mb-3">
              Example Question Text: What is the capital of France?
            </p>

            {/* Options */}
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Type: Essay
              </p>
              <p className="text-sm">Students will answer in essay format</p>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                Sample Answer / Rubric:
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-300 whitespace-pre-wrap">
                A sample answer for an essay question would be a detailed
                response that thoroughly addresses the prompt, providing
                insights, analysis, and supporting evidence to demonstrate a
                comprehensive understanding of the topic.
              </p>
            </div>
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

export default Essay;
