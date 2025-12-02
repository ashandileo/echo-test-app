"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import {
  Plus,
  Trash2,
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  MessageSquare,
  List,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuestionType = "multiple_choice" | "essay";

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // Hanya untuk pilihan ganda
  correctAnswer?: number; // Hanya untuk pilihan ganda
  sampleAnswer?: string; // Hanya untuk essay (contoh jawaban)
  explanation?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function QuizConfigurationPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionType, setQuestionType] =
    useState<QuestionType>("multiple_choice");
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    sampleAnswer: "",
    explanation: "",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm an AI Assistant ready to help you create questions based on the uploaded learning document. Feel free to ask anything or ask me to create questions.",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState<"multiple_choice" | "essay">(
    "multiple_choice"
  );
  // Initialize uploaded document from localStorage
  const getInitialDocument = (): { name: string; size: number } | null => {
    if (typeof window === "undefined") return null;
    const storedDoc = localStorage.getItem("uploadedQuizDocument");
    if (storedDoc) {
      try {
        return JSON.parse(storedDoc);
      } catch (error) {
        console.error("Error parsing stored document:", error);
        return null;
      }
    }
    return null;
  };

  const [uploadedDocument] = useState<{
    name: string;
    size: number;
  } | null>(getInitialDocument);
  const messageIdCounter = useRef(0);
  const questionIdCounter = useRef(0);

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) return;

    if (questionType === "multiple_choice") {
      // Validation for multiple choice
      if (!currentQuestion.options.every((opt) => opt.trim())) {
        return;
      }
    }

    questionIdCounter.current += 1;
    const newQuestion: Question = {
      id: `q-${questionIdCounter.current}`,
      type: questionType,
      question: currentQuestion.question,
      ...(questionType === "multiple_choice"
        ? {
            options: [...currentQuestion.options],
            correctAnswer: currentQuestion.correctAnswer,
          }
        : {
            sampleAnswer: currentQuestion.sampleAnswer,
          }),
      explanation: currentQuestion.explanation,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      sampleAnswer: "",
      explanation: "",
    });
    // Close dialog after question is successfully added
    setIsDialogOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    // Reset form when changing question type
    setCurrentQuestion({
      question: currentQuestion.question, // Keep the question
      options: ["", "", "", ""],
      correctAnswer: 0,
      sampleAnswer: "",
      explanation: "",
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    // Reset form when dialog is closed
    if (!open) {
      setCurrentQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        sampleAnswer: "",
        explanation: "",
      });
      setQuestionType("multiple_choice");
    }
  };

  const handleGenerateExplanation = async () => {
    if (!currentQuestion.question.trim()) {
      return;
    }

    if (questionType === "multiple_choice") {
      const correctOption =
        currentQuestion.options[currentQuestion.correctAnswer];
      if (!correctOption?.trim()) {
        return;
      }
    }

    setIsGeneratingExplanation(true);

    // Simulate AI generation (in production, this would call an actual API)
    setTimeout(() => {
      let generatedExplanation = "";

      if (questionType === "multiple_choice") {
        const correctOption =
          currentQuestion.options[currentQuestion.correctAnswer];
        generatedExplanation = `The correct answer is ${String.fromCharCode(
          65 + currentQuestion.correctAnswer
        )}. ${correctOption}. ${
          currentQuestion.question
        } because ${correctOption} is the most appropriate choice based on the concepts learned. This answer demonstrates correct understanding of the material being tested.`;
      } else {
        generatedExplanation = `To answer the question "${currentQuestion.question}", students need to provide a comprehensive and structured explanation. A good answer should include the main concept, relevant examples, and a clear conclusion. Ensure the student's answer demonstrates deep understanding of the topic being asked.`;
      }

      setCurrentQuestion({
        ...currentQuestion,
        explanation: generatedExplanation,
      });
      setIsGeneratingExplanation(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    messageIdCounter.current += 1;
    const userMessage: ChatMessage = {
      id: `msg-${messageIdCounter.current}`,
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    const userInput = chatInput;
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call an actual API)
    setTimeout(() => {
      messageIdCounter.current += 1;
      const aiResponse: ChatMessage = {
        id: `msg-${messageIdCounter.current}`,
        role: "assistant",
        content: generateAIResponse(userInput),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (
      lowerInput.includes("create question") ||
      lowerInput.includes("generate") ||
      lowerInput.includes("question")
    ) {
      return `Based on the learning document "${
        uploadedDocument?.name || "that has been uploaded"
      }", here is a sample question you can use:

**Question 1:**
Question: [Sample question based on the document]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]

Correct answer: A

You can adjust this question according to your needs. Is there a specific topic from the document you'd like to focus on?`;
    }

    if (lowerInput.includes("help") || lowerInput.includes("assist")) {
      return `I can help you with:
- Creating questions based on the learning document
- Providing suggestions for effective questions
- Explaining concepts from the document
- Helping to structure answer choices

Feel free to ask what you need!`;
    }

    return `I understand your question about "${userInput}". Based on the uploaded learning document, I can help you create relevant questions. Is there a specific topic you'd like to focus on?`;
  };

  const handleUseAISuggestion = (suggestion: string) => {
    // Extract question from AI suggestion (simplified)
    if (suggestion.includes("Question:")) {
      const lines = suggestion.split("\n");
      const questionLine = lines.find((line) => line.includes("Question:"));
      if (questionLine) {
        const question = questionLine.replace("Question:", "").trim();
        setCurrentQuestion({
          ...currentQuestion,
          question: question || currentQuestion.question,
        });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Quiz Questions
            </h2>
            <p className="text-muted-foreground">
              Create and manage your quiz questions with AI Assistant
            </p>
          </div>
          <Button
            onClick={() => setIsAIOpen(true)}
            className="gap-2"
            variant="outline"
          >
            <MessageSquare className="size-4" />
            Open AI Assistant
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Panel Pembuatan Soal */}
          <div className="flex flex-col gap-6">
            {/* Daftar Soal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Question List ({questions.length})</CardTitle>
                    <CardDescription>
                      Questions you&apos;ve created
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {questions.length > 0 && (
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>
                          MC:{" "}
                          {
                            questions.filter(
                              (q) => q.type === "multiple_choice"
                            ).length
                          }
                        </span>
                        <span>•</span>
                        <span>
                          Essay:{" "}
                          {questions.filter((q) => q.type === "essay").length}
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="size-4" />
                      Add Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {/* Tabs */}
              {questions.length > 0 && (
                <div className="border-b px-6">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                        activeTab === "multiple_choice"
                          ? "border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveTab("multiple_choice")}
                    >
                      Multiple Choice (
                      {
                        questions.filter((q) => q.type === "multiple_choice")
                          .length
                      }
                      )
                    </Button>
                    <Button
                      variant="ghost"
                      className={`h-10 rounded-none border-b-2 border-transparent px-4 ${
                        activeTab === "essay"
                          ? "border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveTab("essay")}
                    >
                      Essay (
                      {questions.filter((q) => q.type === "essay").length})
                    </Button>
                  </div>
                </div>
              )}
              <CardContent>
                {(() => {
                  const filteredQuestions = questions.filter(
                    (q) => q.type === activeTab
                  );

                  if (filteredQuestions.length === 0) {
                    return (
                      <p className="text-muted-foreground text-center py-8">
                        {questions.length === 0
                          ? "No questions yet. Start creating your first question!"
                          : `No ${
                              activeTab === "multiple_choice"
                                ? "multiple choice"
                                : "essay"
                            } questions yet.`}
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, index) => (
                        <Card key={q.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-semibold">
                                    Question {index + 1}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      q.type === "multiple_choice"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                    }`}
                                  >
                                    {q.type === "multiple_choice"
                                      ? "Multiple Choice"
                                      : "Essay"}
                                  </span>
                                  <CheckCircle2 className="size-4 text-green-500" />
                                </div>
                                <p className="font-medium mb-3">{q.question}</p>

                                {/* Tampilan untuk Pilihan Ganda */}
                                {q.type === "multiple_choice" && q.options && (
                                  <>
                                    <div className="space-y-1">
                                      {q.options.map((opt, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className={`text-sm ${
                                            optIndex === q.correctAnswer
                                              ? "text-green-600 font-medium"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}.{" "}
                                          {opt}
                                          {optIndex === q.correctAnswer && " ✓"}
                                        </div>
                                      ))}
                                    </div>
                                    {q.explanation && (
                                      <p className="text-sm text-muted-foreground mt-2 italic">
                                        Explanation: {q.explanation}
                                      </p>
                                    )}
                                  </>
                                )}

                                {/* Display for Essay */}
                                {q.type === "essay" && (
                                  <>
                                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Type: Essay
                                      </p>
                                      <p className="text-sm">
                                        Students will answer in essay format
                                      </p>
                                    </div>
                                    {q.sampleAnswer && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                                          Sample Answer / Rubric:
                                        </p>
                                        <p className="text-sm text-blue-900 dark:text-blue-300 whitespace-pre-wrap">
                                          {q.sampleAnswer}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="shrink-0"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant Sidebar */}
      <Sheet open={isAIOpen} onOpenChange={setIsAIOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 h-full"
        >
          <SheetHeader className="border-b p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>
                  Get help creating questions based on the learning document
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.role === "assistant" &&
                      message.content.includes("Question") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            handleUseAISuggestion(message.content);
                            setIsAIOpen(false);
                          }}
                        >
                          Use Suggestion
                        </Button>
                      )}
                  </div>
                  {message.role === "user" && (
                    <div className="shrink-0 size-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask something or request help creating questions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isLoading}
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send message
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog Form Pembuatan Soal */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          {/* Sticky Header */}
          <DialogHeader className="sticky top-0 z-10 bg-background border-b p-6 pb-4 shrink-0">
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Select question type and fill in the form below to create a new
              question
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
            <FieldGroup>
              {/* Select Question Type */}
              <Field>
                <FieldLabel>Question Type</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        questionType === "multiple_choice"
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleQuestionTypeChange("multiple_choice")
                      }
                      className="flex-1"
                    >
                      <List className="size-4" />
                      Multiple Choice
                    </Button>
                    <Button
                      type="button"
                      variant={questionType === "essay" ? "default" : "outline"}
                      onClick={() => handleQuestionTypeChange("essay")}
                      className="flex-1"
                    >
                      <FileText className="size-4" />
                      Essay
                    </Button>
                  </div>
                </FieldContent>
              </Field>

              {/* Question */}
              <Field>
                <FieldLabel>Question</FieldLabel>
                <FieldContent>
                  <Textarea
                    placeholder="Enter the question..."
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        question: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </FieldContent>
              </Field>

              {/* Form for Multiple Choice */}
              {questionType === "multiple_choice" && (
                <>
                  <Field>
                    <FieldLabel>Answer Options</FieldLabel>
                    <FieldContent>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={
                                  currentQuestion.correctAnswer === index
                                }
                                onChange={() =>
                                  setCurrentQuestion({
                                    ...currentQuestion,
                                    correctAnswer: index,
                                  })
                                }
                                className="size-4"
                              />
                              <Label className="text-sm font-medium">
                                {String.fromCharCode(65 + index)}.
                              </Label>
                            </div>
                            <Input
                              placeholder={`Option ${String.fromCharCode(
                                65 + index
                              )}`}
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <div className="flex items-center justify-between w-full">
                        <span>Explanation (Optional)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateExplanation}
                          disabled={
                            isGeneratingExplanation ||
                            !currentQuestion.question.trim() ||
                            !currentQuestion.options[
                              currentQuestion.correctAnswer
                            ]?.trim()
                          }
                          className="gap-2"
                        >
                          {isGeneratingExplanation ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-3" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </div>
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        placeholder="Enter explanation for the correct answer..."
                        value={currentQuestion.explanation}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            explanation: e.target.value,
                          })
                        }
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the &quot;Generate with AI&quot; button to create
                        an automatic explanation based on the question and
                        correct answer
                      </p>
                    </FieldContent>
                  </Field>
                </>
              )}

              {/* Form for Essay */}
              {questionType === "essay" && (
                <Field>
                  <FieldLabel>Sample Answer / Rubric (Optional)</FieldLabel>
                  <FieldContent>
                    <Textarea
                      placeholder="Enter sample answer or grading rubric to help with assessment..."
                      value={currentQuestion.sampleAnswer}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          sampleAnswer: e.target.value,
                        })
                      }
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sample answer or grading rubric will help you assess
                      student answers
                    </p>
                  </FieldContent>
                </Field>
              )}
            </FieldGroup>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t p-6 pt-4 shrink-0">
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestion}
              disabled={
                !currentQuestion.question.trim() ||
                (questionType === "multiple_choice" &&
                  currentQuestion.options.some((opt) => !opt.trim()))
              }
            >
              <Plus className="size-4" />
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
