import Link from "next/link";
import type { MetagameArchetype } from "@/lib/api/metagames";
import { ColorPips } from "./ColorPips";

interface Props {
  archetypes: MetagameArchetype[];
  metagameId: string;
}

export function ArchetypesList({ archetypes, metagameId }: Props) {
  if (archetypes.length === 0) {
    return <p className="text-sm text-text-muted">No archetypes recorded.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {archetypes.map((a) => (
        <li key={a.id}>
          <Link
            href={`/metagames/${metagameId}/archetypes/${a.id}`}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-4 py-3 transition-colors hover:border-primary hover:bg-bg-dark"
          >
            <span className="font-medium text-text">{a.name}</span>
            <ColorPips colors={a.colors} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
