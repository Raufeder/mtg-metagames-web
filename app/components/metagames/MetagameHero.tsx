import type { MetagameDetail } from "@/lib/api/metagames";
import { SetIcon } from "./SetIcon";

interface Props {
  metagame: MetagameDetail;
  format?: string;
}

import { formatDate } from "@/lib/utils/date";

export function MetagameHero({ metagame, format = "Standard" }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">{metagame.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {formatDate(metagame.start_date)} — {formatDate(metagame.end_date)}
          </p>
        </div>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {format}
        </span>
      </div>

      {metagame.sets.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Legal Sets</p>
          <div className="flex w-full items-center justify-between gap-4">
            {metagame.sets.map((s) => (
              <SetIcon key={s.set_code} set={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
