import { post } from "./client";

export interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

export function createTournament(
  metagameId: number,
  data: { name: string; start_date: string; end_date: string; location: string }
): Promise<Tournament> {
  return post<Tournament>(`/metagames/${metagameId}/tournaments`, data);
}
