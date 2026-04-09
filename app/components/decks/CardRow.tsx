"use client";

import type { ScryfallCard } from "@/lib/api/scryfall";

interface Props {
  quantity: number;
  card: ScryfallCard;
  onHover: (card: ScryfallCard | null) => void;
}

export function CardRow({ quantity, card, onHover }: Props) {
  return (
    <li
      className="flex items-baseline gap-2 py-0.5 cursor-default"
      onMouseEnter={() => onHover(card)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="w-5 shrink-0 text-right text-sm font-semibold text-text-muted">
        {quantity}
      </span>
      <span className="text-sm text-text">{card.name}</span>
    </li>
  );
}
