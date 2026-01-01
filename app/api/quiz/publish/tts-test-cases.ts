/**
 * Test cases for prepareTextForTTS function
 *
 * This file documents the expected behavior when processing text for TTS
 */

// Test Case 1: Standard blank with 4 underscores
const test1 = "She ____ study every day to prepare.";
// Expected: "She blank study every day to prepare."

// Test Case 2: Longer blank with 5+ underscores
const test2 = "The cat _____ on the mat.";
// Expected: "The cat blank on the mat."

// Test Case 3: Multiple blanks in one sentence
const test3 = "He ____ to ____ every morning.";
// Expected: "He blank to blank every morning."

// Test Case 4: Blank at the beginning
const test4 = "____ is my favorite subject.";
// Expected: "blank is my favorite subject."

// Test Case 5: Blank at the end
const test5 = "I really like ____.";
// Expected: "I really like blank."

// Test Case 6: Text without blanks (should remain unchanged)
const test6 = "This is a normal sentence.";
// Expected: "This is a normal sentence."

// Test Case 7: Multiple spaces around blank
const test7 = "She    ____    study hard.";
// Expected: "She blank study hard."

export const testCases = [
  { input: test1, description: "Standard blank (4 underscores)" },
  { input: test2, description: "Longer blank (5+ underscores)" },
  { input: test3, description: "Multiple blanks" },
  { input: test4, description: "Blank at beginning" },
  { input: test5, description: "Blank at end" },
  { input: test6, description: "No blanks" },
  { input: test7, description: "Multiple spaces" },
];
