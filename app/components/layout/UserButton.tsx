"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { LoginModal } from "./LoginModal";

export function UserButton() {
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.app_metadata?.role === "admin";
  const label = user?.email?.split("@")[0] ?? "Account";

  if (!user) {
    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          aria-label="Sign in"
          className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-dark hover:text-text"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-dark hover:text-text"
      >
        {label}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-bg shadow-lg py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-text hover:bg-bg-dark"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-bg-dark"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
