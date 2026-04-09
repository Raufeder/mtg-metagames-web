import { get, post } from "./client";
import type { Tournament } from "./tournaments";

export interface Metagame {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  format: string;
}

export interface MetagameSet {
  name: string;
  set_code: string;
  scryfall_id: string;
  icon_set_image: string;
}

export interface MetagameArchetype {
  id: string;
  name: string;
  colors: string[];
}

export interface MetagameDetail extends Metagame {
  tournaments: Tournament[];
  archetypes: MetagameArchetype[];
  sets: MetagameSet[];
  banlist: string[];
  restrictedlist: string[];
  format: string;
}

// Raw shape returned by the backend before flattening join tables
interface RawMetagameDetail extends Metagame {
  tournaments: Tournament[];
  metagames_archetypes: { archetypes: MetagameArchetype }[];
  metagame_sets: { sets: MetagameSet }[];
  metagame_banlist: { card_name: string }[];
  metagame_restrictedlist: { card_name: string }[];
  format: string;
}

export interface SetResult {
  name: string;
  code: string;
}

export function getMetagames(): Promise<Metagame[]> {
  return get<Metagame[]>("/metagames");
}

export async function getMetagame(id: string): Promise<MetagameDetail> {
  const raw = await get<RawMetagameDetail>(`/metagames/${id}`);
  return {
    id: raw.id,
    name: raw.name,
    start_date: raw.start_date,
    end_date: raw.end_date,
    tournaments: raw.tournaments,
    archetypes: raw.metagames_archetypes.map((r) => r.archetypes),
    sets: raw.metagame_sets.map((r) => r.sets),
    banlist: raw.metagame_banlist.map((r) => r.card_name),
    restrictedlist: (raw.metagame_restrictedlist ?? []).map((r) => r.card_name),
    format: raw.format,
  };
}

export function createMetagame(data: {
  name: string;
  start_date: string;
  end_date: string;
}): Promise<Metagame> {
  return post<Metagame>("/metagames", data);
}

export function addSet(metagameId: string, set_name: string): Promise<SetResult> {
  return post<SetResult>(`/metagames/${metagameId}/sets`, { set_name });
}

export function addBanlist(metagameId: string, card_list: string): Promise<unknown> {
  return post(`/metagames/${metagameId}/banlist`, { card_list });
}

export function addRestrictedList(metagameId: string, card_list: string): Promise<unknown> {
  return post(`/metagames/${metagameId}/restrictedlist`, { card_list });
}
