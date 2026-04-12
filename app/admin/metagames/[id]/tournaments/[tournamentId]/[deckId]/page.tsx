"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { getDeck, addCards, removeCard } from "@/lib/api/decks";
import { getMetagame } from "@/lib/api/metagames";
import { fetchCardsByIds } from "@/lib/api/scryfall";
import { useToast } from "@/lib/toast/context";
import type { DeckDetail, DecklistCard } from "@/lib/api/decks";
import type { ScryfallCard } from "@/lib/api/scryfall";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextareaField } from "@/app/components/atoms/form_atoms/TextareaField";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";
import { getCardImageUrl } from "@/lib/api/scryfall";
import { Banner } from "@/app/components/atoms/Banner";
import Image from "next/image";
import { endingOfPlacement } from "@/lib/utils/placementEnding";

interface Props {
  params: Promise<{ id: string; tournamentId: string; deckId: string }>;
}

export default function AdminDeckPage({ params }: Props) {
  const { id: metagameId, tournamentId, deckId } = use(params);
  const { addToast } = useToast();

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [cardData, setCardData] = useState<Record<string, ScryfallCard>>({});
  const [metagameName, setMetagameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DecklistCard | null>(null);
  const [addingCards, setAddingCards] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);

  useEffect(() => {
    Promise.all([getDeck(deckId), getMetagame(metagameId)])
      .then(async ([d, m]) => {
        setDeck(d);
        setMetagameName(m.name);
        if (d.decklist_cards.length > 0) {
          const ids = d.decklist_cards.map((c) => c.scryfall_id);
          const map = await fetchCardsByIds(ids);
          setCardData(Object.fromEntries(map));
        }
      })
      .finally(() => setLoading(false));
  }, [deckId, metagameId]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><PageSpinner className="h-16 w-16 text-text-muted" /></div>;
  if (!deck) return <p className="p-10 text-center text-sm text-danger">Not found</p>;

  const maindeck = deck.decklist_cards.filter((c) => !c.is_sideboard);
  const sideboard = deck.decklist_cards.filter((c) => c.is_sideboard);

  async function handleRemoveCard(card: DecklistCard) {
    await removeCard(deckId, card.scryfall_id);
    setDeck((prev) => prev
      ? { ...prev, decklist_cards: prev.decklist_cards.filter((c) => c.scryfall_id !== card.scryfall_id) }
      : prev
    );
    setDeleteTarget(null);
    addToast("Card removed", "success");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <nav className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
        <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
        <span>/</span>
        <Link href={`/admin/metagames/${metagameId}`} className="hover:text-text transition-colors">{metagameName}</Link>
        <span>/</span>
        <Link href={`/admin/metagames/${metagameId}/tournaments/${tournamentId}`} className="hover:text-text transition-colors">{deck.tournaments.name}</Link>
        <span>/</span>
        <span className="text-text">{deck.player_name}</span>
      </nav>

      <div>
        <div className="flex items-center gap-3">
          <ColorPips colors={deck.archetypes.colors} size="md" />
          <h1 className="text-2xl font-semibold text-text">{deck.player_name}</h1>
        </div>
        <p className="text-sm text-text-muted mt-1">
          {deck.archetypes.name} · {deck.tournaments.name}
                    {deck.placement && (
            <span>
              {` · ${endingOfPlacement(deck.placement)} place`}
            </span>
          )}
        </p>
      </div>

      {(() => {
        const mainCount = maindeck.reduce((s, c) => s + c.quantity, 0);
        const sideCount = sideboard.reduce((s, c) => s + c.quantity, 0);
        const msgs: string[] = [];
        if (mainCount < 60) msgs.push(`Missing ${60 - mainCount} maindeck card${60 - mainCount !== 1 ? "s" : ""}`);
        if (sideCount < 15) msgs.push(`Missing ${15 - sideCount} sideboard card${15 - sideCount !== 1 ? "s" : ""}`);
        if (msgs.length === 0) return null;
        return <Banner variant="warning" title="This decklist is probably not complete" messages={msgs} />;
      })()}

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Card image preview */}
        <div className="order-last md:sticky md:top-24 md:shrink-0">
          <div className="h-[279px] w-[200px] md:h-[418px] md:w-[300px] mx-auto md:mx-0 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
            {hoveredCard && getCardImageUrl(hoveredCard) ? (
              <Image
                src={getCardImageUrl(hoveredCard)!}
                alt={hoveredCard.name}
                width={300}
                height={418}
                className="rounded-xl"
                unoptimized
              />
            ) : (
              <span className="text-xs text-text-muted select-none">Hover a card</span>
            )}
          </div>
        </div>

        {/* Card lists */}
        <div className="flex-1 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <CardSection
            title={`Maindeck (${maindeck.reduce((s, c) => s + c.quantity, 0)})`}
            cards={maindeck}
            cardData={cardData}
            onDelete={setDeleteTarget}
            onHover={setHoveredCard}
          />
          <CardSection
            title={`Sideboard (${sideboard.reduce((s, c) => s + c.quantity, 0)})`}
            cards={sideboard}
            cardData={cardData}
            onDelete={setDeleteTarget}
            onHover={setHoveredCard}
          />
        </div>
      </div>

      {/* Add cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Add Cards</h2>
          {!addingCards && (
            <Button onClick={() => setAddingCards(true)} className="gap-1.5">
              <Icon name="Plus" size={14} /> Add Cards
            </Button>
          )}
        </div>
        <div className={`grid transition-all duration-200 ${addingCards ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <AddCardsForm
              deckId={deckId}
              onCancel={() => setAddingCards(false)}
              onSave={async () => {
                const updated = await getDeck(deckId);
                const ids = updated.decklist_cards.map((c) => c.scryfall_id);
                const map = await fetchCardsByIds(ids);
                setDeck(updated);
                setCardData(Object.fromEntries(map));
                setAddingCards(false);
                addToast("Cards added", "success");
              }}
            />
          </div>
        </div>
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Remove Card"
        message={`Remove "${cardData[deleteTarget?.scryfall_id ?? ""]?.name ?? "this card"}" from the decklist?`}
        confirmLabel="Remove"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleRemoveCard(deleteTarget!)}
      />
    </div>
  );
}

function CardSection({ title, cards, cardData, onDelete, onHover }: {
  title: string;
  cards: DecklistCard[];
  cardData: Record<string, ScryfallCard>;
  onDelete: (c: DecklistCard) => void;
  onHover: (card: ScryfallCard | null) => void;
}) {
  if (cards.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      <ul className="space-y-0.5">
        {cards.map((c) => {
          const card = cardData[c.scryfall_id];
          return (
            <li
              key={c.scryfall_id}
              className="flex items-center justify-between gap-2 py-0.5 group cursor-default"
              onMouseEnter={() => card && onHover(card)}
              onMouseLeave={() => onHover(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-right text-sm font-semibold text-text-muted">{c.quantity}</span>
                <span className="text-sm text-text">{card?.name ?? c.scryfall_id}</span>
              </div>
              <button
                onClick={() => onDelete(c)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger"
              >
                <Icon name="X" size={13} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AddCardsForm({ deckId, onCancel, onSave }: {
  deckId: string;
  onCancel: () => void;
  onSave: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<{ card_list: string }>();
  const cardList = watch("card_list", "");

  // A line is a "card line" if it matches "N cardname" — otherwise it's a label like "Sideboard"
  function isCardLine(line: string) {
    return /^\d+\s+\S/.test(line.trim());
  }

  async function onSubmit(values: { card_list: string }) {
    try {
      const result = await addCards(deckId, values.card_list.trim());
      await onSave();

      if (result.failedCards.length > 0) {
        const failedSet = new Set(result.failedCards.map((n) => n.toLowerCase()));
        // Keep lines that either failed or aren't card lines (e.g. "Sideboard")
        const remaining = values.card_list
          .split("\n")
          .filter((line) => {
            if (!isCardLine(line)) return true;
            const cardName = line.trim().replace(/^\d+\s+/, "");
            return failedSet.has(cardName.toLowerCase());
          })
          .join("\n");
        setValue("card_list", remaining);
        addToast(`${result.failedCards.length} card${result.failedCards.length !== 1 ? "s" : ""} could not be found`, "error");
      } else {
        setValue("card_list", "");
        addToast("Cards added", "success");
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add cards", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-primary bg-bg-light px-4 py-4 mb-2 space-y-3">
      <TextareaField
        label=""
        registration={register("card_list", { required: true })}
        placeholder={"4 Lightning Bolt\n2 Counterspell"}
        hint="Format: quantity name (one per line)"
        rows={6}
        mono
      />
      <div className="flex gap-2">
        <Button type="submit" variant="success" loading={isSubmitting} disabled={!cardList?.trim()} className="gap-1.5">
          <Icon name="Plus" size={13} /> Add Cards
        </Button>
        <Button onClick={onCancel} className="gap-1.5">
          <Icon name="X" size={13} /> Cancel
        </Button>
      </div>
    </form>
  );
}
