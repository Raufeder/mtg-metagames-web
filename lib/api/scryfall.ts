export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  image_uris?: {
    normal: string;
    large: string;
  };
  // Double-faced cards have card_faces instead of top-level image_uris
  card_faces?: { image_uris?: { normal: string; large: string } }[];
}

interface ScryfallCollectionResponse {
  data: ScryfallCard[];
  not_found: { id: string }[];
}

/** Fetch up to 75 cards by Scryfall ID in a single batch request. */
export async function fetchCardsByIds(ids: string[]): Promise<Map<string, ScryfallCard>> {
  if (ids.length === 0) return new Map();

  const res = await fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifiers: ids.map((id) => ({ id })) }),
    next: { revalidate: 86400 }, // cache card data for 24h — card text doesn't change
  });

  if (!res.ok) {
    throw new Error(`Scryfall batch fetch failed: ${res.status}`);
  }

  const json = (await res.json()) as ScryfallCollectionResponse;

  const map = new Map<string, ScryfallCard>();
  for (const card of json.data) {
    map.set(card.id, card);
  }
  return map;
}

/** Returns the front-face image URL, handling double-faced cards. */
export function getCardImageUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return null;
}
