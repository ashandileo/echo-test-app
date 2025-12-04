"use client";

import { useState } from "react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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
    setUploadProgress("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress("Extracting text from PDF...");

    try {
      // Step 1: Extract text using OCR
      const ocrFormData = new FormData();
      ocrFormData.append("file", selectedFile);

      const ocrResponse = await fetch("/api/ocr/extract", {
        method: "POST",
        body: ocrFormData,
      });

      if (!ocrResponse.ok) {
        const error = await ocrResponse.json();
        throw new Error(error.error || "Failed to extract text from PDF");
      }

      const ocrData = await ocrResponse.json();
      console.log("OCR Response:", ocrData);

      // Step 2: Convert file to base64 for storage
      setUploadProgress("Processing document and generating embeddings...");
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Step 3: Process document and generate embeddings
      const processResponse = await fetch("/api/quiz/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown: ocrData.markdown,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          mistralFileId: ocrData.fileId,
          file: base64File,
        }),
      });

      if (!processResponse.ok) {
        const error = await processResponse.json();
        throw new Error(
          error.error || "Failed to process document and generate embeddings"
        );
      }

      const processData = await processResponse.json();
      console.log("Process Response:", processData);

      // Step 4: Create quiz with AI-generated name and description
      setUploadProgress("Creating quiz...");
      const createQuizResponse = await fetch("/api/quiz/create-from-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: processData.data.filePath,
        }),
      });

      if (!createQuizResponse.ok) {
        const error = await createQuizResponse.json();
        throw new Error(error.error || "Failed to create quiz");
      }

      const quizData = await createQuizResponse.json();
      console.log("Quiz Created:", quizData);

      setUploadProgress("Quiz created successfully!");

      // Close dialog and redirect to quiz configuration page
      setTimeout(() => {
        onOpenChange(false);
        setSelectedFile(null);
        setUploadProgress("");
        // Redirect to quiz configuration page
        window.location.href = `/quiz/${quizData.data.id}/configuration`;
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress(
        error instanceof Error ? error.message : "Failed to upload document"
      );
      setTimeout(() => setUploadProgress(""), 3000);
    } finally {
      setIsUploading(false);
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
        {uploadProgress && (
          <div className="px-1 py-2">
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            <Upload className="mr-2 size-4" />
            {isUploading ? "Processing..." : "Upload & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
