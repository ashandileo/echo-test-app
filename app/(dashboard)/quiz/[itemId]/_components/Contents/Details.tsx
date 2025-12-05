import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const Details = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>Quiz Information</CardTitle>
            <CardDescription>Basic information about your quiz</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="size-4" />
            <span className="sr-only">Edit quiz information</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Quiz Name
          </p>
          <p className="text-base">Quiz Name</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Quiz Description
          </p>
          <p className="text-base">Quiz Description</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Details;
