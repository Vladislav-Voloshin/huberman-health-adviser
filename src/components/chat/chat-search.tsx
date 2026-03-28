"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchResult {
  message_id: string;
  session_id: string;
  session_title: string;
  role: string;
  snippet: string;
  created_at: string;
}

interface ChatSearchProps {
  onSelectResult: (sessionId: string) => void;
}

export function ChatSearch({ onSelectResult }: ChatSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestQueryRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    latestQueryRef.current = trimmed;

    // Abort any in-flight request so stale responses never call setState
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (trimmed.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    try {
      const res = await fetch(
        `/api/chat/search?q=${encodeURIComponent(trimmed)}`,
        { signal: controller.signal },
      );
      if (latestQueryRef.current !== trimmed) return;
      if (res.ok) {
        const data = await res.json();
        if (latestQueryRef.current !== trimmed) return;
        setResults(data.results);
        setShowResults(true);
      }
    } catch (err: unknown) {
      // Silently ignore aborted requests
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    } finally {
      if (latestQueryRef.current === trimmed) {
        setSearching(false);
      }
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 300);
  }

  function handleSelect(sessionId: string) {
    onSelectResult(sessionId);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  function clearSearch() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    latestQueryRef.current = "";
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  // Close results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          placeholder="Search messages..."
          className="h-7 text-xs pl-7 pr-7"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover shadow-md z-50">
          {searching ? (
            <p className="text-xs text-muted-foreground text-center py-3">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">No results found</p>
          ) : (
            results.map((r) => (
              <button
                key={r.message_id}
                onClick={() => handleSelect(r.session_id)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
              >
                <p className="text-xs text-muted-foreground truncate">
                  {r.session_title} · {r.role}
                </p>
                <p className="text-xs line-clamp-2 mt-0.5">{r.snippet}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
