import { notFound } from "next/navigation";
import Link from "next/link";
import { getTournament } from "@/lib/api/tournaments";
import { getMetagame } from "@/lib/api/metagames";
import { DeckTable, type DeckRow } from "@/app/components/decks/DeckTable";

interface Props {
  params: Promise<{ id: string; tournamentId: string }>;
}

import { formatDate } from "@/lib/utils/date";

export default async function TournamentPage({ params }: Props) {
  const { id, tournamentId } = await params;

  let tournament;
  let metagame;
  try {
    [tournament, metagame] = await Promise.all([
      getTournament(id, tournamentId),
      getMetagame(id),
    ]);
  } catch {
    notFound();
  }

  const decks: DeckRow[] = tournament.decks.map((d) => ({
    id: d.id,
    name: d.name,
    placement: d.placement,
    player_name: d.player_name,
    archetype: d.archetypes,
    tournament: { id: tournament.id, name: tournament.name, metagame_id: tournament.metagame_id },
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href={`/metagames/${id}`} className="transition-colors hover:text-text">
          ← {metagame.name}
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">{tournament.name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
          {tournament.location && <span>{tournament.location}</span>}
          <span>
            {tournament.start_date === tournament.end_date
              ? formatDate(tournament.start_date)
              : `${formatDate(tournament.start_date)} – ${formatDate(tournament.end_date)}`}
          </span>
          <span>{tournament.decks.length} decks</span>
        </div>
      </div>

      {/* Decks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">Results</h2>
        <DeckTable decks={decks} hideTournament />
      </section>
    </div>
  );
}
