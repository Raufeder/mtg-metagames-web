import Link from "next/link";
import { ColorPips } from "@/app/components/metagames/ColorPips";

export interface DeckRow {
  id: string;
  name: string;
  placement: number;
  player_name: string;
  archetype: { id: string; name: string; colors: string[] };
  tournament: { id: string; name: string; metagame_id: string };
}

interface Props {
  decks: DeckRow[];
  /** Hide the tournament column when already on a tournament page */
  hideTournament?: boolean;
  /** Hide the archetype column when already on an archetype page */
  hideArchetype?: boolean;
}

export function DeckTable({ decks, hideTournament, hideArchetype }: Props) {
  const sorted = [...decks].sort((a, b) => a.placement - b.placement);

  if (sorted.length === 0) {
    return <p className="text-sm text-text-muted">No decks recorded.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
            <th className="pb-2 pr-4">#</th>
            <th className="pb-2 pr-4">Deck</th>
            <th className="pb-2 pr-4">Player</th>
            {!hideArchetype && <th className="pb-2 pr-4">Archetype</th>}
            {!hideTournament && <th className="pb-2">Tournament</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((d) => (
            <tr key={d.id} className="group">
              <td className="py-3 pr-4 text-text-muted">{d.placement}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/metagames/${d.tournament.metagame_id}/tournaments/${d.tournament.id}/${d.id}`}
                  className="font-medium text-text transition-colors hover:text-primary"
                >
                  {d.name}
                </Link>
              </td>
              <td className="py-3 pr-4 text-text-muted">{d.player_name}</td>
              {!hideArchetype && (
                <td className="py-3 pr-4">
                  <Link
                    href={`/metagames/${d.tournament.metagame_id}/archetypes/${d.archetype.id}`}
                    className="flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <span>{d.archetype.name}</span>
                    <ColorPips colors={d.archetype.colors} size="sm" />
                  </Link>
                </td>
              )}
              {!hideTournament && (
                <td className="py-3 text-text-muted">
                  <Link
                    href={`/metagames/${d.tournament.metagame_id}/tournaments/${d.tournament.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {d.tournament.name}
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
