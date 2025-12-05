"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const LearningDocument = () => {
  const params = useParams();
  const supabase = createClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Fetch quiz to get source_document_path
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz-source-document", params.itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz")
        .select("source_document_path")
        .eq("id", params.itemId as string)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch document details from document_learnings
  const { data: document, isLoading: isLoadingDocument } = useQuery({
    queryKey: ["learning-document", quiz?.source_document_path],
    queryFn: async () => {
      if (!quiz?.source_document_path) return null;

      const { data, error } = await supabase
        .from("document_learnings")
        .select("file_name, file_path, file_size, file_type")
        .eq("file_path", quiz.source_document_path)
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!quiz?.source_document_path,
  });

  const isLoading = isLoadingQuiz || isLoadingDocument;

  const handlePreview = async () => {
    if (!document?.file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("learning-documents")
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) throw error;
      if (data?.signedUrl) {
        setPdfUrl(data.signedUrl);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error generating signed URL:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
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
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Pencil className="size-4" />
              <span className="sr-only">Edit learning document</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
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
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No document attached to this quiz
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
            onClick={handlePreview}
          >
            <div className="shrink-0 p-2 rounded-lg bg-muted">
              <FileText className="size-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {document.file_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(document.file_size)}
              </p>
            </div>
            <ExternalLink className="size-4 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-full! max-h-full! w-screen! h-screen! p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{document.file_name}</DialogTitle>
            <DialogDescription>
              Preview of your learning document
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden w-full h-[calc(100vh-80px)]">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LearningDocument;
