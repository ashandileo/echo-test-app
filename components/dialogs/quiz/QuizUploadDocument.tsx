"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Upload, X } from "lucide-react";

interface QuizUploadDocumentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizUploadDocument({
  open,
  onOpenChange,
}: QuizUploadDocumentProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const ocrFormData = new FormData();
      ocrFormData.append("file", selectedFile);

      const ocrResponse = await fetch("/api/ocr/extract", {
        method: "POST",
        body: ocrFormData,
      });

      console.log("ocrResponse", ocrResponse);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <DialogTitle>Upload Learning Document</DialogTitle>
          </div>
          <DialogDescription>
            Upload your learning material in PDF format. Our AI will analyze the
            document and help you create quiz questions that align with your
            teaching content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document">Select PDF Document</Label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          {selectedFile && (
            <Card className="border bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 p-2 rounded-lg bg-muted">
                      <FileText className="size-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button disabled={!selectedFile} onClick={handleUpload}>
            <Upload className="mr-2 size-4" />
            Upload & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
