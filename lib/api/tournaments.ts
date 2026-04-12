import { get, post, patch, del } from "./client";

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  metagame_id: string;
}

export interface TournamentDeck {
  id: string;
  name: string;
  placement: number;
  player_name: string;
  archetype_id: string;
  tournament_id: string;
  archetypes: {
    id: string;
    name: string;
    colors: string[];
  };
}

export interface TournamentDetail extends Tournament {
  decks: TournamentDeck[];
}

export function getTournament(metagameId: string, tournamentId: string): Promise<TournamentDetail> {
  return get<TournamentDetail>(`/metagames/${metagameId}/tournaments/${tournamentId}`);
}

export function createTournament(
  metagameId: string,
  data: { name: string; start_date: string; end_date: string; location: string }
): Promise<Tournament> {
  return post<Tournament>(`/metagames/${metagameId}/tournaments`, data);
}

export function updateTournament(
  metagameId: string,
  tournamentId: string,
  data: Partial<{ name: string; start_date: string; end_date: string; location: string }>
): Promise<Tournament> {
  return patch<Tournament>(`/metagames/${metagameId}/tournaments/${tournamentId}`, data);
}

export function deleteTournament(metagameId: string, tournamentId: string): Promise<void> {
  return del(`/metagames/${metagameId}/tournaments/${tournamentId}`);
}
