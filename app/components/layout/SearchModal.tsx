"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { search, type SearchResults } from "@/lib/api/search";

interface Props {
  open: boolean;
  onClose: () => void;
}

const searchTypes = [
  "Metagame Name (eg. Scars of Mirrodin Standard)",
  "Tournament Name (eg. 2010 World Championships)",
  "Tournament Location (eg. Chiba, Japan)",
  "Archetype Name (eg. UW Control)",
  "Player Name (eg. Brian Kibler)",
  "Name of Deck (eg. UW Hawk Control (Caw Go))"
];

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    search(debouncedQuery.trim())
      .then((data) => setResults(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Search failed"))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isEmpty =
    !loading &&
    !error &&
    results &&
    results.metagames.length === 0 &&
    results.tournaments.length === 0 &&
    results.archetypes.length === 0 &&
    results.decks.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-text/20 backdrop-blur-sm pt-[10vh] px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal panel — full screen on mobile, centered card on md+ */}
      <div className="flex flex-col w-full max-w-[80vw] max-h-[50vh] rounded-xl border border-border bg-bg shadow-xl overflow-hidden max-md:fixed max-md:inset-0 max-md:max-w-none max-md:max-h-none max-md:rounded-none">
        {/* Search bar */}
        <div className="border-b border-border px-4 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search metagames, tournaments, archetypes, players…"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-text-muted"
            />
            <button
              onClick={onClose}
              className="rounded px-2 py-1 text-xs text-text-muted hover:text-text border border-border"
            >
              Esc
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-6">
          {loading && (
            <p className="text-center text-sm text-text-muted">Searching…</p>
          )}
          {error && (
            <p className="text-center text-sm text-danger">{error}</p>
          )}
          {isEmpty && (
            <p className="text-center text-sm text-text-muted">No results for "{debouncedQuery}"</p>
          )}
          {!loading && !error && results && (
            <>
              <ResultSection title="Metagames" count={results.metagames.length}>
                {results.metagames.map((m) => (
                  <ResultLink key={m.id} href={`/metagames/${m.id}`} onClick={onClose}>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-text-muted text-xs">{m.start_date} → {m.end_date}</span>
                  </ResultLink>
                ))}
              </ResultSection>

              <ResultSection title="Tournaments" count={results.tournaments.length}>
                {results.tournaments.map((t) => (
                  <ResultLink key={t.id} href={`/metagames/${t.metagame_id}`} onClick={onClose}>
                    <span className="font-medium">{t.name}</span>
                    {t.location && <span className="text-text-muted text-xs">{t.location}</span>}
                  </ResultLink>
                ))}
              </ResultSection>

              <ResultSection title="Archetypes" count={results.archetypes.length}>
                {results.archetypes.map((a) => (
                  <ResultLink key={a.id} href={`/metagames/${a.metagame_id}`} onClick={onClose}>
                    <span className="font-medium">{a.name}</span>
                    {a.colors.length > 0 && (
                      <span className="text-text-muted text-xs font-mono">{a.colors.join("")}</span>
                    )}
                  </ResultLink>
                ))}
              </ResultSection>

              <ResultSection title="Decks" count={results.decks.length}>
                {results.decks.map((d) => (
                  <ResultLink key={d.id} href={`/metagames/${d.tournament_id}/${d.id}`} onClick={onClose}>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-text-muted text-xs">{d.player_name}</span>
                  </ResultLink>
                ))}
              </ResultSection>
            </>
          )}
          {!query.trim() && (
            <p className="text-center text-sm text-text-muted">
              Search by:
              <br />
              <ul>
                {searchTypes.map((type) => (
                  <li key={type} className="mt-1">
                    {type}
                  </li>
                ))}
              </ul>
            </p>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function ResultLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-baseline justify-between gap-4 rounded-md px-3 py-2 hover:bg-bg-dark transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
