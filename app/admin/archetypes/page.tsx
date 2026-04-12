"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArchetypes } from "@/lib/api/archetypes";
import type { Archetype } from "@/lib/api/archetypes";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { Icon } from "@/app/components/atoms/Icon";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

export default function AdminArchetypesPage() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArchetypes()
      .then((all) => setArchetypes(all.sort((a, b) => a.name.localeCompare(b.name))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PageSpinner className="h-16 w-16 text-text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <nav className="text-xs text-text-muted flex items-center gap-2">
        <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
        <span>/</span>
        <span className="text-text">Archetypes</span>
      </nav>

      <h1 className="text-2xl font-semibold text-text">Archetypes</h1>

      <div className="space-y-1">
        {archetypes.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <ColorPips colors={a.colors} size="sm" />
              <span className="text-sm font-medium text-text">{a.name}</span>
            </div>
            <Link
              href={`/admin/archetypes/${a.id}`}
              className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-text-muted hover:border-primary hover:text-primary transition-colors"
            >
              Edit <Icon name="ArrowRight" size={12} />
            </Link>
          </div>
        ))}

        {archetypes.length === 0 && (
          <p className="text-sm text-text-muted text-center py-10">No archetypes yet.</p>
        )}
      </div>
    </div>
  );
}
