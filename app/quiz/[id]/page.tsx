"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Pencil } from "lucide-react";

interface UploadedDocument {
  name: string;
  size: number;
}

export default function QuizInformationPage({}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [quizName, setQuizName] = useState("Untitled");
  const [quizDescription, setQuizDescription] = useState("description");
  const [uploadedDocument, setUploadedDocument] =
    useState<UploadedDocument | null>(null);

  useEffect(() => {
    // Get uploaded document from localStorage
    const storedDoc = localStorage.getItem("uploadedQuizDocument");
    if (storedDoc) {
      try {
        const doc = JSON.parse(storedDoc);
        setUploadedDocument(doc);
      } catch (error) {
        console.error("Error parsing stored document:", error);
        router.push("/quiz");
      }
    } else {
      // If no document found, redirect back to quiz list
      router.push("/quiz");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Quiz Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>
                Basic information about your quiz
              </CardDescription>
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
            <p className="text-base">{quizName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quiz Description
            </p>
            <p className="text-base">{quizDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Document Card */}
      {uploadedDocument && (
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
                <p className="font-medium text-sm truncate">
                  {uploadedDocument.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
