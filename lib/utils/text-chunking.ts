/**
 * Chunk text into smaller pieces for embedding generation
 * @param text The text to chunk
 * @param chunkSize The maximum size of each chunk in characters
 * @param overlap The number of characters to overlap between chunks
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start index forward, accounting for overlap
    startIndex += chunkSize - overlap;

    // Prevent infinite loop
    if (startIndex >= text.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Count tokens approximately (rough estimate: 1 token ≈ 4 characters)
 * @param text The text to count tokens for
 * @returns Approximate token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Chunk text by sentence boundaries for better semantic coherence
 * @param text The text to chunk
 * @param maxChunkSize Maximum size per chunk in characters
 * @returns Array of text chunks
 */
export function chunkBySentence(
  text: string,
  maxChunkSize: number = 1000
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by sentence boundaries (., !, ?, \n\n)
  const sentences = text.split(/(?<=[.!?])\s+|\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (trimmedSentence.length === 0) {
      continue;
    }

    // If adding this sentence exceeds max size, start a new chunk
    if (currentChunk.length + trimmedSentence.length + 1 > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // If a single sentence is longer than max size, split it
      if (trimmedSentence.length > maxChunkSize) {
        const subChunks = chunkText(trimmedSentence, maxChunkSize, 100);
        chunks.push(...subChunks);
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? " " : "") + trimmedSentence;
    }
  }

  // Add the last chunk if it exists
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
