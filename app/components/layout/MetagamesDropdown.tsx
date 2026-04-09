"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ACCEPTABLE_FORMATS } from "@/lib/constants/formats";

export function MetagamesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
      >
        Metagames
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-bg shadow-lg">
          {ACCEPTABLE_FORMATS.map((f) => (
            <Link
              key={f}
              href={f === "Standard" ? "/metagames?format=Standard" : "/metagames"}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2 text-sm text-text-muted transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-bg-dark hover:text-text"
            >
              {f}
              {f === "Standard" && (
                <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] font-semibold text-success">Live</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
