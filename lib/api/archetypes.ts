import { get, post, patch, del } from "./client";

export interface Archetype {
  id: string;
  name: string;
  colors: string[];
}

export interface ArchetypeDeck {
  id: string;
  name: string | null;
  placement: number | null;
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

export function getArchetypes(): Promise<Archetype[]> {
  return get<Archetype[]>("/archetypes");
}

export function getArchetype(metagameId: string, archetypeId: string): Promise<ArchetypeDetail> {
  return get<ArchetypeDetail>(`/metagames/${metagameId}/archetypes/${archetypeId}`);
}

export function linkArchetype(metagameId: string, archetypeId: string): Promise<Archetype> {
  return post<Archetype>(`/metagames/${metagameId}/archetypes`, { archetype_id: archetypeId });
}

export function addArchetype(
  metagameId: string,
  name: string,
  colors: string[]
): Promise<Archetype> {
  return post<Archetype>(`/metagames/${metagameId}/archetypes`, { name, colors });
}

export function updateArchetype(
  metagameId: string,
  archetypeId: string,
  data: Partial<{ name: string; colors: string[] }>
): Promise<Archetype> {
  return patch<Archetype>(`/metagames/${metagameId}/archetypes/${archetypeId}`, data);
}

export function deleteArchetype(metagameId: string, archetypeId: string): Promise<void> {
  return del(`/metagames/${metagameId}/archetypes/${archetypeId}`);
}
