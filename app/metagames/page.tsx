import { Suspense } from "react";
import { getMetagames, getMetagame } from "@/lib/api/metagames";
import { MetagameFormatFilter } from "@/app/components/metagames/MetagameFormatFilter";

export default async function MetagamesPage() {
  const list = await getMetagames();

  const sorted = [...list].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const metagames = await Promise.all(sorted.map((m) => getMetagame(m.id)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Metagames</h1>
        <p className="text-sm text-text-muted">{metagames.length} total</p>
      </div>

      {metagames.length === 0 ? (
        <p className="text-text-muted">No metagames yet.</p>
      ) : (
        <Suspense>
          <MetagameFormatFilter metagames={metagames} />
        </Suspense>
      )}

      <p className="mt-8 text-center text-xs text-text-muted">
        Pagination coming soon · {metagames.length} metagames loaded
      </p>
    </div>
  );
}
