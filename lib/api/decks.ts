import { post } from "./client";

export interface Deck {
  id: number;
  player_name: string;
  name: string | null;
  placement: number | null;
}

export function createDeck(data: {
  archetype_id: string;
  tournament_id: string;
  player_name: string;
  name?: string;
  placement?: number;
}): Promise<Deck> {
  return post<Deck>("/decks", data);
}

export function addCards(deckId: number, card_list: string): Promise<unknown> {
  return post(`/decks/${deckId}/cards`, { card_list });
}
