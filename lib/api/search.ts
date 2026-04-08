import { get } from "./client";

export interface SearchArchetype {
  id: string;
  name: string;
  colors: string[];
  metagame_id: string;
}

export interface SearchDeck {
  id: string;
  name: string;
  player_name: string;
  tournament_id: string;
}

export interface SearchTournament {
  id: string;
  name: string;
  location: string;
  metagame_id: string;
}

export interface SearchMetagame {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface SearchResults {
  metagames: SearchMetagame[];
  tournaments: SearchTournament[];
  archetypes: SearchArchetype[];
  decks: SearchDeck[];
}

export function search(q: string): Promise<SearchResults> {
  return get<SearchResults>(`/search?q=${encodeURIComponent(q)}`);
}
