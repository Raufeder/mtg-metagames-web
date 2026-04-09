import { get, post } from "./client";

export interface Deck {
  id: string;
  player_name: string;
  name: string | null;
  placement: number | null;
  tournament_id: string;
  archetype_id: string;
}

export interface DecklistCard {
  deck_id: string;
  quantity: number;
  scryfall_id: string;
  is_sideboard: boolean;
}

export interface DeckDetail extends Deck {
  archetypes: { id: string; name: string; colors: string[] };
  tournaments: {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    metagame_id: string;
  };
  decklist_cards: DecklistCard[];
}

export function getDeck(deckId: string): Promise<DeckDetail> {
  return get<DeckDetail>(`/decks/${deckId}`);
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

export function addCards(deckId: string, card_list: string): Promise<unknown> {
  return post(`/decks/${deckId}/cards`, { card_list });
}
