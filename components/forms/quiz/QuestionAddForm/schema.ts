import { z } from "zod";

export const questionFormSchema = z.object({
  type: z.enum(["multiple_choice", "essay"]),
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.number().optional(),
  sampleAnswer: z.string().optional(),
  explanation: z.string().optional(),
  // New fields for question and answer modes
  questionMode: z.enum(["text", "audio"]).optional(), // For multiple choice questions
  answerMode: z.enum(["text", "voice"]).optional(), // For essay questions
  // Audio script for listening test questions
  audioScript: z.string().optional(), // Script to be read aloud (separate from question)
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
