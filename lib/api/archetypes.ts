import { post } from "./client";

export interface Archetype {
  id: number;
  name: string;
  colors: string[];
}

export function addArchetype(
  metagameId: number,
  name: string,
  colors: string[]
): Promise<Archetype> {
  return post<Archetype>(`/metagames/${metagameId}/archetypes`, { name, colors });
}
