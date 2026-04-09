import Link from "next/link";
import type { MetagameDetail } from "@/lib/api/metagames";
import { SetIcon } from "./SetIcon";
import { ColorPips } from "./ColorPips";

interface Props {
  metagame: MetagameDetail;
}

import { formatDate } from "@/lib/utils/date";

export function MetagameCard({ metagame }: Props) {
  const shownTournaments = metagame.tournaments.slice(0, 2);
  const shownArchetypes = metagame.archetypes.slice(0, 3);

  return (
    <Link
      href={`/metagames/${metagame.id}`}
      className="block rounded-xl border border-border bg-bg-light p-5 transition-colors hover:border-primary hover:bg-bg-dark"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text">{metagame.name}</h2>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {metagame.format}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatDate(metagame.start_date)} — {formatDate(metagame.end_date)}
          </p>
        </div>
        {metagame.sets.length > 0 && (
          <div className="flex items-center gap-2">
            {metagame.sets.map((s) => (
              <SetIcon key={s.set_code} set={s} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="mt-4 grid grid-cols-2 gap-6">
        {/* Tournaments */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Tournaments</p>
          {shownTournaments.length > 0 ? (
            <ul className="space-y-1">
              {shownTournaments.map((t) => (
                <li key={t.id} className="truncate text-sm text-text">{t.name}</li>
              ))}
              {metagame.tournaments.length > 2 && (
                <li className="text-xs text-text-muted">+{metagame.tournaments.length - 2} more</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-text-muted">None recorded</p>
          )}
        </div>

        {/* Archetypes */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Archetypes</p>
          {shownArchetypes.length > 0 ? (
            <ul className="space-y-1.5">
              {shownArchetypes.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="truncate text-sm text-text">{a.name}</span>
                  <ColorPips colors={a.colors} size="sm" />
                </li>
              ))}
              {metagame.archetypes.length > 3 && (
                <li className="text-xs text-text-muted">+{metagame.archetypes.length - 3} more</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-text-muted">None recorded</p>
          )}
        </div>
      </div>
    </Link>
  );
}
