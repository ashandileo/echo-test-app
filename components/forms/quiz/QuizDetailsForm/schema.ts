import { z } from "zod";

export const quizDetailsSchema = z.object({
  name: z
    .string()
    .min(1, "Quiz name is required")
    .min(3, "Quiz name must be at least 3 characters")
    .max(100, "Quiz name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
});

export type QuizDetailsFormValues = z.infer<typeof quizDetailsSchema>;
