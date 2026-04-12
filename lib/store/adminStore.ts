import { create } from "zustand";
import type { MetagameDetail, MetagameArchetype } from "@/lib/api/metagames";
import type { Tournament } from "@/lib/api/tournaments";

interface AdminStore {
  metagame: MetagameDetail | null;

  // Load full metagame into store
  setMetagame: (m: MetagameDetail) => void;

  // Patch top-level metagame fields (name, dates, format, banlist, restrictedlist)
  patchMetagame: (patch: Partial<MetagameDetail>) => void;

  // Tournament mutations
  addTournament: (t: Tournament) => void;
  updateTournament: (id: string, patch: Partial<Tournament>) => void;
  removeTournament: (id: string) => void;

  // Archetype mutations
  addArchetype: (a: MetagameArchetype) => void;
  updateArchetype: (id: string, patch: Partial<MetagameArchetype>) => void;
  removeArchetype: (id: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  metagame: null,

  setMetagame: (m) => set({ metagame: m }),

  patchMetagame: (patch) =>
    set((state) =>
      state.metagame ? { metagame: { ...state.metagame, ...patch } } : state
    ),

  addTournament: (t) =>
    set((state) =>
      state.metagame
        ? { metagame: { ...state.metagame, tournaments: [...state.metagame.tournaments, t] } }
        : state
    ),

  updateTournament: (id, patch) =>
    set((state) =>
      state.metagame
        ? {
            metagame: {
              ...state.metagame,
              tournaments: state.metagame.tournaments.map((t) =>
                t.id === id ? { ...t, ...patch } : t
              ),
            },
          }
        : state
    ),

  removeTournament: (id) =>
    set((state) =>
      state.metagame
        ? {
            metagame: {
              ...state.metagame,
              tournaments: state.metagame.tournaments.filter((t) => t.id !== id),
            },
          }
        : state
    ),

  addArchetype: (a) =>
    set((state) =>
      state.metagame
        ? { metagame: { ...state.metagame, archetypes: [...state.metagame.archetypes, a] } }
        : state
    ),

  updateArchetype: (id, patch) =>
    set((state) =>
      state.metagame
        ? {
            metagame: {
              ...state.metagame,
              archetypes: state.metagame.archetypes.map((a) =>
                a.id === id ? { ...a, ...patch } : a
              ),
            },
          }
        : state
    ),

  removeArchetype: (id) =>
    set((state) =>
      state.metagame
        ? {
            metagame: {
              ...state.metagame,
              archetypes: state.metagame.archetypes.filter((a) => a.id !== id),
            },
          }
        : state
    ),
}));
