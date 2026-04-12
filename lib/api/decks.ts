import { get, post, patch, del } from "./client";

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

export interface AddCardsResult {
  message: string;
  failedCards: string[];
}

export function addCards(deckId: string, card_list: string): Promise<AddCardsResult> {
  return post<AddCardsResult>(`/decks/${deckId}/cards`, { card_list });
}

export function updateDeck(
  deckId: string,
  data: Partial<{ name: string; player_name: string; placement: number }>
): Promise<Deck> {
  return patch<Deck>(`/decks/${deckId}`, data);
}

export function deleteDeck(deckId: string): Promise<void> {
  return del(`/decks/${deckId}`);
}

export function removeCard(deckId: string, scryfallId: string): Promise<void> {
  return del(`/decks/${deckId}/cards/${scryfallId}`);
}
