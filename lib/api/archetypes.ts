import { get, post } from "./client";

export interface Archetype {
  id: string;
  name: string;
  colors: string[];
}

export interface ArchetypeDeck {
  id: string;
  name: string;
  placement: number;
  player_name: string;
  archetype_id: string;
  tournament_id: string;
  tournaments: {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    metagame_id: string;
  };
}

export interface ArchetypeDetail extends Archetype {
  decks: ArchetypeDeck[];
}

export function getArchetype(metagameId: string, archetypeId: string): Promise<ArchetypeDetail> {
  return get<ArchetypeDetail>(`/metagames/${metagameId}/archetypes/${archetypeId}`);
}

export function addArchetype(
  metagameId: string,
  name: string,
  colors: string[]
): Promise<Archetype> {
  return post<Archetype>(`/metagames/${metagameId}/archetypes`, { name, colors });
}
