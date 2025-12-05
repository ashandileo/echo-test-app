import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Pencil } from "lucide-react";

const LearningDocument = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>Learning Document</CardTitle>
            <CardDescription>
              The document you uploaded for quiz generation
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="size-4" />
            <span className="sr-only">Edit learning document</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-lg bg-muted">
            <FileText className="size-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">Document Name</p>
            <p className="text-xs text-muted-foreground mt-0.5">100 MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningDocument;
