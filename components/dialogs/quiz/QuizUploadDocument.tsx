"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

import { useRouter } from "next/navigation";

import {
  BookOpen,
  CheckCircle2,
  CloudUpload,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      toast.success("File selected successfully!", {
        description: `${file.name} is ready to upload`,
      });
    } else if (file) {
      toast.error("Invalid file type", {
        description: "Please select a PDF file",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxFiles: 1,
      multiple: false,
    });

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
  };

  // Progress toast component that updates based on state
  const ProgressToast = ({
    step,
    message,
    description,
  }: {
    step: number;
    message: string;
    description: string;
  }) => {
    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
    const widthClass = step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full";

    return (
      <div className="flex flex-col gap-2 w-full min-w-[320px]">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="size-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-primary rounded-full transition-all duration-700 ease-out ${widthClass} ${
              step === 3 ? "animate-pulse" : ""
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    let toastId: string | number = "";

    // Step 1: Extract text from PDF
    toastId = toast(
      <ProgressToast
        step={1}
        message="Extracting text from PDF..."
        description="Step 1 of 3 • Processing your document"
      />,
      {
        duration: Infinity,
      }
    );

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

      // Step 2: Process document and generate embeddings
      toast(
        <ProgressToast
          step={2}
          message="Processing document and generating embeddings..."
          description="Step 2 of 3 • Analyzing your content"
        />,
        {
          id: toastId,
          duration: Infinity,
        }
      );
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

      // Step 3: Create quiz with AI-generated name and description
      toast(
        <ProgressToast
          step={3}
          message="Creating quiz..."
          description="Step 3 of 3 • Almost done!"
        />,
        {
          id: toastId,
          duration: Infinity,
        }
      );
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

      // Success toast
      toast.success("Quiz created successfully!", {
        id: toastId,
        description: "Redirecting to quiz configuration...",
      });

      onOpenChange(false);
      setSelectedFile(null);

      // Redirect to quiz configuration page
      router.push(`/quiz/${quizData.data.id}/configuration`);
    } catch (error) {
      toast.error("Upload failed", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Failed to upload document",
      });
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
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 cursor-pointer
                transition-all duration-200 ease-in-out
                ${
                  isDragActive && !isDragReject
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : isDragReject
                      ? "border-destructive bg-destructive/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div
                  className={`
                  p-4 rounded-full transition-colors
                  ${
                    isDragActive && !isDragReject
                      ? "bg-primary/10"
                      : isDragReject
                        ? "bg-destructive/10"
                        : "bg-muted"
                  }
                `}
                >
                  <CloudUpload
                    className={`
                    size-10 transition-colors
                    ${
                      isDragActive && !isDragReject
                        ? "text-primary"
                        : isDragReject
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }
                  `}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold">
                    {isDragActive && !isDragReject
                      ? "Drop your PDF here"
                      : isDragReject
                        ? "Only PDF files are accepted"
                        : "Drag & drop your PDF here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="size-4" />
                  <span>Supported format: PDF only</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="shrink-0 relative">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                          <FileText className="size-6 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-green-500 border-2 border-background">
                          <CheckCircle2 className="size-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-semibold text-base truncate mb-1">
                          {selectedFile.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary/60" />
                            <span className="font-medium">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary/60" />
                            <span>PDF Document</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Ready to upload
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                    >
                      <X className="size-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="px-1">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-green-500" />
                  <span>
                    File validated successfully. Click &quot;Upload &
                    Continue&quot; to proceed.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
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
