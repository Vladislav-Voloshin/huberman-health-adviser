import { describe, it, expect } from "vitest";
import { chunkText } from "./chunker";

describe("chunkText", () => {
  it("returns a single chunk for short text", () => {
    const chunks = chunkText("Hello world.");
    expect(chunks).toEqual(["Hello world."]);
  });

  it("splits long text at sentence boundaries", () => {
    const sentence = "This is a test sentence. ";
    // ~25 chars per sentence × 50 = ~1250 chars → should produce >1 chunk
    const text = sentence.repeat(50);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
    // Each chunk should end with a sentence boundary
    for (const chunk of chunks) {
      expect(chunk.trim()).toMatch(/[.!?]$/);
    }
  });

  it("creates overlap between consecutive chunks", () => {
    const sentence = "This is sentence number one. ";
    const text = sentence.repeat(80); // well over 1000 chars
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
    // Second chunk should start with text from end of first chunk (overlap)
    const overlapText = chunks[0].slice(-100);
    expect(chunks[1]).toContain(overlapText.trim().split(". ").pop());
  });

  it("handles text without sentence terminators", () => {
    const text = "no punctuation here";
    const chunks = chunkText(text);
    expect(chunks).toEqual(["no punctuation here"]);
  });

  it("handles empty string", () => {
    const chunks = chunkText("");
    expect(chunks).toEqual([]);
  });

  it("keeps chunks under ~1200 chars", () => {
    const sentence = "A moderately long sentence that has some content in it. ";
    const text = sentence.repeat(100);
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      // Allow some tolerance for overlap carry-over
      expect(chunk.length).toBeLessThan(1500);
    }
  });
});
