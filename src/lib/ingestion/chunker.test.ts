import { describe, it, expect, vi, beforeEach } from "vitest";
import { chunkText } from "./chunker";

// ---------------------------------------------------------------------------
// Mock the shared module so processAndStoreChunks / chunk* don't hit real DB
// ---------------------------------------------------------------------------
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockNot = vi.fn();
const mockSelect = vi.fn();

// eq needs special handling: it is used both in SELECT chains (returns queryBuilder)
// and as the final terminator in UPDATE chains (should resolve).
// We handle this per-test.
const mockEq = vi.fn();

// Chainable query builder — all methods point to the same object for chaining
const queryBuilder = {
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
  eq: mockEq,
  not: mockNot,
};

function resetMocks() {
  mockInsert.mockReset();
  mockUpdate.mockReset();
  mockSelect.mockReset();
  mockEq.mockReset();
  mockNot.mockReset();

  mockInsert.mockResolvedValue({ error: null });
  mockUpdate.mockReturnValue(queryBuilder);
  mockSelect.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder); // default: return queryBuilder for chaining
  mockNot.mockResolvedValue({ data: [] }); // default: no episodes/newsletters
}

resetMocks();

const mockFrom = vi.fn().mockReturnValue(queryBuilder);
const mockSupabase = { from: mockFrom };

vi.mock("./shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./shared")>();
  return {
    ...actual,
    getSupabaseAdmin: vi.fn(() => mockSupabase),
  };
});

describe("chunkText", () => {
  it("returns a single chunk for short text", () => {
    const chunks = chunkText("Hello world.");
    expect(chunks).toEqual(["Hello world."]);
  });

  it("splits long text at sentence boundaries", () => {
    const sentence = "This is a test sentence. ";
    const text = sentence.repeat(50);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.trim()).toMatch(/[.!?]$/);
    }
  });

  it("creates overlap between consecutive chunks", () => {
    const sentence = "This is sentence number one. ";
    const text = sentence.repeat(80);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
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
      expect(chunk.length).toBeLessThan(1500);
    }
  });
});

describe("processAndStoreChunks", () => {
  beforeEach(() => {
    resetMocks();
    mockFrom.mockReturnValue(queryBuilder);
  });

  it("stores chunks in content_chunks table and returns count", async () => {
    const { processAndStoreChunks } = await import("./chunker");
    const count = await processAndStoreChunks({
      source_type: "podcast",
      source_title: "Test Episode",
      source_id: "ep-1",
      content: "Short content.",
    });
    expect(mockFrom).toHaveBeenCalledWith("content_chunks");
    expect(mockInsert).toHaveBeenCalled();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("attaches chunk_index and total_chunks metadata to each chunk", async () => {
    const { processAndStoreChunks } = await import("./chunker");
    await processAndStoreChunks({
      source_type: "newsletter",
      source_title: "Weekly Digest",
      source_id: "nl-1",
      content: "Hello world.",
      metadata: { publish_date: "2024-01-01" },
    });

    // The insert is called with an array of chunk objects
    const insertCall = mockInsert.mock.calls[0][0] as Array<{
      metadata: Record<string, string>;
    }>;
    expect(insertCall[0].metadata.chunk_index).toBe("0");
    expect(insertCall[0].metadata.total_chunks).toBe("1");
    // User-supplied metadata should be spread in
    expect(insertCall[0].metadata.publish_date).toBe("2024-01-01");
  });

  it("returns 0 stored when insert errors for all batches", async () => {
    mockInsert.mockResolvedValue({ error: new Error("DB down") });
    const { processAndStoreChunks } = await import("./chunker");
    const count = await processAndStoreChunks({
      source_type: "podcast",
      source_title: "Failing Episode",
      source_id: "ep-fail",
      content: "Some content.",
    });
    expect(count).toBe(0);
  });

  it("handles large content that produces multiple batches", async () => {
    const longSentence = "X".repeat(900) + ". ";
    const bigContent = longSentence.repeat(60);

    const { processAndStoreChunks } = await import("./chunker");
    const count = await processAndStoreChunks({
      source_type: "book",
      source_title: "Big Book",
      source_id: "book-1",
      content: bigContent,
    });
    expect(count).toBeGreaterThan(0);
    expect(mockInsert).toHaveBeenCalled();
  });
});

describe("chunkPodcastEpisodes", () => {
  beforeEach(() => {
    resetMocks();
    mockFrom.mockReturnValue(queryBuilder);
  });

  it("returns 0 when no un-ingested episodes exist", async () => {
    // Query chain: select().eq().not() -> resolves with empty data
    mockNot.mockResolvedValueOnce({ data: [] });
    const { chunkPodcastEpisodes } = await import("./chunker");
    const result = await chunkPodcastEpisodes();
    expect(result).toBe(0);
  });

  it("returns 0 when episodes data is null", async () => {
    mockNot.mockResolvedValueOnce({ data: null });
    const { chunkPodcastEpisodes } = await import("./chunker");
    const result = await chunkPodcastEpisodes();
    expect(result).toBe(0);
  });

  it("processes episodes and marks them as ingested", async () => {
    const episodes = [
      {
        id: "ep-1",
        title: "Sleep Science",
        description: "All about sleep.",
        transcript: "Today we discuss sleep.",
        episode_number: 1,
        publish_date: "2024-01-01",
        guests: ["Dr. Smith"],
      },
    ];
    // SELECT chain: select().eq().not() resolves with episodes
    mockNot.mockResolvedValueOnce({ data: episodes });
    // UPDATE chain: update({ingested:true}).eq("id", ep.id) resolves with no error
    // eq() is already set to mockReturnValue(queryBuilder), but we also need the
    // Promise to resolve. Override so the second eq call resolves directly.
    let eqCallCount = 0;
    mockEq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount === 1) {
        // first eq: part of SELECT chain -> return queryBuilder for .not() to be called
        return queryBuilder;
      }
      // second eq: part of UPDATE chain -> resolve the promise
      return Promise.resolve({ error: null });
    });

    const { chunkPodcastEpisodes } = await import("./chunker");
    const total = await chunkPodcastEpisodes();
    expect(total).toBeGreaterThanOrEqual(1);
    expect(mockFrom).toHaveBeenCalledWith("podcast_episodes");
    expect(mockUpdate).toHaveBeenCalledWith({ ingested: true });
  });
});

describe("chunkNewsletters", () => {
  beforeEach(() => {
    resetMocks();
    mockFrom.mockReturnValue(queryBuilder);
  });

  it("returns 0 when no un-ingested newsletters exist", async () => {
    // SELECT chain: select().eq("ingested", false) resolves with empty data
    mockEq.mockResolvedValueOnce({ data: [] });
    const { chunkNewsletters } = await import("./chunker");
    const result = await chunkNewsletters();
    expect(result).toBe(0);
  });

  it("returns 0 when newsletters data is null", async () => {
    mockEq.mockResolvedValueOnce({ data: null });
    const { chunkNewsletters } = await import("./chunker");
    const result = await chunkNewsletters();
    expect(result).toBe(0);
  });

  it("processes newsletters and marks them as ingested", async () => {
    const newsletters = [
      {
        id: "nl-1",
        title: "Weekly Health Tips",
        content: "Focus on sleep and dopamine.",
        publish_date: "2024-02-01",
        topics: ["sleep", "dopamine"],
      },
    ];
    // SELECT: select().eq("ingested", false) -> resolves with newsletters
    // UPDATE: update({ingested:true}).eq("id", nl.id) -> resolves with no error
    let eqCallCount = 0;
    mockEq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount === 1) {
        return Promise.resolve({ data: newsletters });
      }
      return Promise.resolve({ error: null });
    });

    const { chunkNewsletters } = await import("./chunker");
    const total = await chunkNewsletters();
    expect(total).toBeGreaterThanOrEqual(1);
    expect(mockFrom).toHaveBeenCalledWith("newsletters");
    expect(mockUpdate).toHaveBeenCalledWith({ ingested: true });
  });
});
