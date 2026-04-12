import { get, post, patch, del } from "./client";
import { fetchCardsByIds } from "./scryfall";
import type { ScryfallCard } from "./scryfall";
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
  banlist: ScryfallCard[];
  restrictedlist: ScryfallCard[];
  format: string;
}

// Raw shape returned by the backend before flattening join tables
interface RawMetagameDetail extends Metagame {
  tournaments: Tournament[];
  metagames_archetypes: { archetypes: MetagameArchetype }[];
  metagame_sets: { sets: MetagameSet }[];
  metagame_banlist: { scryfall_id: string }[];
  metagame_restrictedlist: { scryfall_id: string }[];
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

  const banlistIds = (raw.metagame_banlist ?? []).map((r) => r.scryfall_id);
  const restrictedIds = (raw.metagame_restrictedlist ?? []).map((r) => r.scryfall_id);
  const allIds = [...new Set([...banlistIds, ...restrictedIds])];
  const cardMap = allIds.length > 0 ? await fetchCardsByIds(allIds) : new Map();

  return {
    id: raw.id,
    name: raw.name,
    start_date: raw.start_date,
    end_date: raw.end_date,
    tournaments: raw.tournaments,
    archetypes: raw.metagames_archetypes.map((r) => r.archetypes),
    sets: raw.metagame_sets.map((r) => r.sets),
    banlist: banlistIds.map((sid) => cardMap.get(sid)).filter(Boolean) as ScryfallCard[],
    restrictedlist: restrictedIds.map((sid) => cardMap.get(sid)).filter(Boolean) as ScryfallCard[],
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

export function updateMetagame(
  id: string,
  data: Partial<{ name: string; start_date: string; end_date: string; format: string }>
): Promise<Metagame> {
  return patch<Metagame>(`/metagames/${id}`, data);
}

export function deleteMetagame(id: string): Promise<void> {
  return del(`/metagames/${id}`);
}

export function removeSet(metagameId: string, setCode: string): Promise<void> {
  return del(`/metagames/${metagameId}/sets/${setCode}`);
}
