import Link from "next/link";
import type { Tournament } from "@/lib/api/tournaments";

interface Props {
  tournaments: Tournament[];
  metagameId: string;
}

import { formatDate } from "@/lib/utils/date";

export function TournamentsList({ tournaments, metagameId }: Props) {
  if (tournaments.length === 0) {
    return <p className="text-sm text-text-muted">No tournaments recorded.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {tournaments.map((t) => (
        <li key={t.id}>
          <Link
            href={`/metagames/${metagameId}/tournaments/${t.id}`}
            className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-primary"
          >
            <div>
              <p className="font-medium">{t.name}</p>
              {t.location && (
                <p className="text-xs text-text-muted">{t.location}</p>
              )}
            </div>
            <span className="text-sm text-text-muted">
              {t.start_date === t.end_date
                ? formatDate(t.start_date)
                : `${formatDate(t.start_date)} – ${formatDate(t.end_date)}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
