import { notFound } from "next/navigation";
import Link from "next/link";
import { getArchetype } from "@/lib/api/archetypes";
import { getMetagame } from "@/lib/api/metagames";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { DeckTable, type DeckRow } from "@/app/components/decks/DeckTable";

interface Props {
  params: Promise<{ id: string; archetypeId: string }>;
}

export default async function ArchetypePage({ params }: Props) {
  const { id, archetypeId } = await params;

  let archetype;
  let metagame;
  try {
    [archetype, metagame] = await Promise.all([
      getArchetype(id, archetypeId),
      getMetagame(id),
    ]);
  } catch {
    notFound();
  }

  const decks: DeckRow[] = archetype.decks.map((d) => ({
    id: d.id,
    name: d.name,
    placement: d.placement,
    player_name: d.player_name,
    archetype: { id: archetype.id, name: archetype.name, colors: archetype.colors },
    tournament: {
      id: d.tournaments.id,
      name: d.tournaments.name,
      metagame_id: d.tournaments.metagame_id,
    },
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
      <div className="mb-8 flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-text">{archetype.name}</h1>
        <ColorPips colors={archetype.colors} size="md" />
      </div>

      <div className="mb-8 text-sm text-text-muted">
        {archetype.decks.length} deck{archetype.decks.length !== 1 ? "s" : ""} recorded
      </div>

      {/* Decks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">Decks</h2>
        <DeckTable decks={decks} hideArchetype />
      </section>
    </div>
  );
}
