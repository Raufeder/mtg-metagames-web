"use client";

import { useState } from "react";
import Image from "next/image";
import type { DecklistCard } from "@/lib/api/decks";
import type { ScryfallCard } from "@/lib/api/scryfall";
import { getCardImageUrl } from "@/lib/api/scryfall";
import { CardRow } from "./CardRow";

interface Props {
  cards: DecklistCard[];
  cardData: Record<string, ScryfallCard>;
}

export function CardList({ cards, cardData }: Props) {
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);

  const maindeck = cards.filter((c) => !c.is_sideboard);
  const sideboard = cards.filter((c) => c.is_sideboard);

  const mainCount = maindeck.reduce((sum, c) => sum + c.quantity, 0);
  const sideCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);

  const imageUrl = hoveredCard ? getCardImageUrl(hoveredCard) : null;

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      {/* Card image preview — right on desktop, bottom on mobile */}
      <div className="order-last md:sticky md:top-24 md:shrink-0">
        <div className="h-[279px] w-[200px] md:h-[418px] md:w-[300px] mx-auto md:mx-0 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hoveredCard?.name ?? ""}
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
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Maindeck <span className="font-normal">({mainCount})</span>
          </h2>
          <ul className="space-y-0.5">
            {maindeck.map((c) => {
              const card = cardData[c.scryfall_id];
              if (!card) return null;
              return (
                <CardRow
                  key={c.scryfall_id}
                  quantity={c.quantity}
                  card={card}
                  onHover={setHoveredCard}
                />
              );
            })}
          </ul>
        </section>

        {sideboard.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Sideboard <span className="font-normal">({sideCount})</span>
            </h2>
            <ul className="space-y-0.5">
              {sideboard.map((c) => {
                const card = cardData[c.scryfall_id];
                if (!card) return null;
                return (
                  <CardRow
                    key={c.scryfall_id}
                    quantity={c.quantity}
                    card={card}
                    onHover={setHoveredCard}
                  />
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
