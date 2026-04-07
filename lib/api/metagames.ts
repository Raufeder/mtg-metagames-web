import { post } from "./client";

export interface Metagame {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface SetResult {
  name: string;
  code: string;
}

export function createMetagame(data: {
  name: string;
  start_date: string;
  end_date: string;
}): Promise<Metagame> {
  return post<Metagame>("/metagames", data);
}

export function addSet(metagameId: number, set_name: string): Promise<SetResult> {
  return post<SetResult>(`/metagames/${metagameId}/sets`, { set_name });
}

export function addBanlist(metagameId: number, card_list: string): Promise<unknown> {
  return post(`/metagames/${metagameId}/banlist`, { card_list });
}
