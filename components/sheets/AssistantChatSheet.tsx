import { useRef, useState } from "react";

import { Bot, Loader2, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  open: boolean;
  toggleOpen: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AssistantChatSheet = ({ open, toggleOpen }: Props) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm an AI Assistant ready to help you create questions based on the uploaded learning document. Feel free to ask anything or ask me to create questions.",
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const messageIdCounter = useRef(0);

  const handleUseAISuggestion = () => {
    //
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
      return `Based on the learning document "${"that has been uploaded"}", here is a sample question you can use:

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

  return (
    <Sheet open={open} onOpenChange={toggleOpen}>
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
                          handleUseAISuggestion();
                          toggleOpen();
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
  );
};

export default AssistantChatSheet;
