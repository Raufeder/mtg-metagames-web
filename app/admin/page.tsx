export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMetagames } from "@/lib/api/metagames";
import { formatDate } from "@/lib/utils/date";
import { Icon } from "@/app/components/atoms/Icon";

export default async function AdminDashboard() {
  const metagames = await getMetagames();
  const sorted = [...metagames].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/archetypes"
            className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-text-muted hover:border-primary hover:text-primary transition-colors"
          >
            <Icon name="Layers" size={16} />
            Archetypes
          </Link>
          <Link
            href="/admin/metagames/new"
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-bg hover:opacity-80 transition-colors"
          >
            <Icon name="Plus" size={16} />
            New Metagame
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-5 py-4"
          >
            <div>
              <p className="font-medium text-text">{m.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {formatDate(m.start_date)} — {formatDate(m.end_date)} · {m.format}
              </p>
            </div>
            <Link
              href={`/admin/metagames/${m.id}`}
              className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors"
            >
              Manage
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-sm text-text-muted text-center py-10">No metagames yet.</p>
        )}
      </div>
    </div>
  );
}
