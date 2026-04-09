"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { MetagameDetail } from "@/lib/api/metagames";
import { ACCEPTABLE_FORMATS } from "@/lib/constants/formats";
import { MetagameCard } from "./MetagameCard";

interface Props {
  metagames: MetagameDetail[];
}

export function MetagameFormatFilter({ metagames }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("format") ?? "All";

  // Only show chips for formats that exist in the data, ordered by the canonical list
  const available = ["All", ...ACCEPTABLE_FORMATS.filter((f) => metagames.some((m) => m.format === f))];

  function setFormat(format: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (format === "All") {
      params.delete("format");
    } else {
      params.set("format", format);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const filtered = active === "All" ? metagames : metagames.filter((m) => m.format === active);

  return (
    <div>
      {/* Format chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {available.map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
              active === f
                ? "border-primary bg-primary text-bg"
                : "border-border text-text-muted hover:border-primary hover:text-text"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted">No metagames for this format yet.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((m) => (
            <li key={m.id}>
              <MetagameCard metagame={m} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
