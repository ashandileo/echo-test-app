import { z } from "zod";

export const questionFormSchema = z.object({
  type: z.enum(["multiple_choice", "essay"]),
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.number().optional(),
  sampleAnswer: z.string().optional(),
  explanation: z.string().optional(),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
