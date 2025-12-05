import { z } from "zod";

/**
 * Schema for Multiple Choice Options
 * Format: Array of strings ["Option A", "Option B", "Option C", "Option D"]
 */
export const MultipleChoiceOptionsSchema = z.array(z.string());

export type MultipleChoiceOption = string;

/**
 * Parse JSONB options from database
 * @param options - Raw JSONB data from Supabase (array of strings)
 * @returns Parsed and validated array of strings
 */
export function parseMultipleChoiceOptions(
  options: unknown
): MultipleChoiceOption[] {
  try {
    let parsed: unknown = options;

    // Jika options adalah string JSON, parse dulu
    if (typeof options === "string") {
      parsed = JSON.parse(options);
    }

    // Validate dengan Zod
    return MultipleChoiceOptionsSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse multiple choice options:", error);
    return [];
  }
}

/**
 * Safe parse with default value
 */
export function safeParseMultipleChoiceOptions(
  options: unknown,
  defaultValue: MultipleChoiceOption[] = []
): MultipleChoiceOption[] {
  try {
    const result = parseMultipleChoiceOptions(options);
    return result.length > 0 ? result : defaultValue;
  } catch {
    return defaultValue;
  }
}
