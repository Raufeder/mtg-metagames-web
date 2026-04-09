import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeck } from "@/lib/api/decks";
import { getMetagame } from "@/lib/api/metagames";
import { fetchCardsByIds } from "@/lib/api/scryfall";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { CardList } from "@/app/components/decks/CardList";

interface Props {
  params: Promise<{ id: string; tournamentId: string; deckId: string }>;
}

export default async function DecklistPage({ params }: Props) {
  const { id, tournamentId, deckId } = await params;

  let deck;
  let metagame;
  try {
    [deck, metagame] = await Promise.all([
      getDeck(deckId),
      getMetagame(id),
    ]);
  } catch {
    notFound();
  }

  // Batch fetch all card data from Scryfall in one request
  const scryfallIds = deck.decklist_cards.map((c) => c.scryfall_id);
  const cardMap = await fetchCardsByIds(scryfallIds);
  // Convert Map → plain object for client component serialization
  const cardData = Object.fromEntries(cardMap);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href={`/metagames/${id}`} className="transition-colors hover:text-text">
          {metagame.name}
        </Link>
        <span>/</span>
        <Link href={`/metagames/${id}/tournaments/${tournamentId}`} className="transition-colors hover:text-text">
          {deck.tournaments.name}
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-text">{deck.name}</h1>
          <ColorPips colors={deck.archetypes.colors} size="md" />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
          <span>{deck.player_name}</span>
          {deck.placement && (
            <span>
              {deck.placement === 1 ? "🥇 1st place" : `${deck.placement}th place`}
            </span>
          )}
          <span>{deck.tournaments.name}</span>
          {deck.tournaments.location && <span>{deck.tournaments.location}</span>}
        </div>
      </div>

      {/* Decklist */}
      <CardList cards={deck.decklist_cards} cardData={cardData} />
    </div>
  );
}
