"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { MetagamesDropdown } from "./MetagamesDropdown";
import { UserButton } from "./UserButton";
import { useAuth } from "@/lib/auth/context";

export function Header() {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-semibold tracking-tight text-text hover:text-primary transition-colors">
              MTG Metagames
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-text-muted">
              <MetagamesDropdown />
              {user?.app_metadata?.role === "admin" && (
                <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile: icon only */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-dark hover:text-text"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <ThemeToggle />
            </div>

            {/* Desktop: full search bar */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="hidden md:flex w-96 items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-muted shadow-sm transition-colors hover:border-primary focus-visible:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="flex-1 text-left">Search metagames, decks, players…</span>
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">/</kbd>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
