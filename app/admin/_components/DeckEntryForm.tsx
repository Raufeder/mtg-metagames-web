"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { addArchetype, type Archetype } from "@/lib/api/archetypes";
import { createDeck, addCards } from "@/lib/api/decks";
import type { Metagame } from "@/lib/api/metagames";
import type { Tournament } from "@/lib/api/tournaments";

interface DeckFormValues {
  tournament_id: string;
  archetype_id: string;
  player_name: string;
  name: string;
  placement: string;
  card_list: string;
}

interface Props {
  metagame: Metagame;
  tournaments: Tournament[];
}

export function DeckEntryForm({ metagame, tournaments }: Props) {
  const { addToast } = useToast();
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [newArchetypeName, setNewArchetypeName] = useState("");
  const [addingArchetype, setAddingArchetype] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<DeckFormValues>();

  async function handleAddArchetype() {
    if (!newArchetypeName.trim()) return;
    setAddingArchetype(true);
    try {
      const data = await addArchetype(metagame.id, newArchetypeName.trim());
      setArchetypes((prev) =>
        prev.find((a) => a.id === data.id) ? prev : [...prev, data]
      );
      setValue("archetype_id", String(data.id));
      addToast(`Archetype "${data.name}" ready`, "success");
      setNewArchetypeName("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add archetype", "error");
    } finally {
      setAddingArchetype(false);
    }
  }

  async function onSubmitDeck(values: DeckFormValues) {
    try {
      const deckPayload: Parameters<typeof createDeck>[0] = {
        archetype_id: values.archetype_id,
        tournament_id: values.tournament_id,
        player_name: values.player_name,
      };
      if (values.name.trim()) deckPayload.name = values.name.trim();
      if (values.placement.trim())
        deckPayload.placement = Number(values.placement);

      const deck = await createDeck(deckPayload);
      addToast(`Deck #${deck.id} created. Adding cards…`, "success");

      await addCards(deck.id, values.card_list);
      addToast(`Deck #${deck.id} (${values.player_name}) saved with cards`, "success");

      reset({ tournament_id: values.tournament_id, archetype_id: values.archetype_id });
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to submit deck", "error");
    }
  }

  return (
    <div className="space-y-8">
      {/* 2a. Archetype */}
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-base font-semibold">2a. Archetype</h2>
        <div className="flex flex-wrap gap-3">
          {archetypes.length > 0 && (
            <select
              {...register("archetype_id")}
              className="rounded border px-2 py-1.5 text-sm"
            >
              <option value="">— select existing —</option>
              {archetypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
          <input
            value={newArchetypeName}
            onChange={(e) => setNewArchetypeName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddArchetype()}
            placeholder="New archetype name"
            className="rounded border px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddArchetype}
            disabled={!newArchetypeName.trim() || addingArchetype}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {addingArchetype ? "Adding…" : "Add / Get Archetype"}
          </button>
        </div>
      </section>

      {/* 2b & 2c. Deck form */}
      <form onSubmit={handleSubmit(onSubmitDeck)} className="space-y-6">
        <section className="rounded-lg border p-5">
          <h2 className="mb-4 text-base font-semibold">2b. Deck Info</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Tournament
              <select
                {...register("tournament_id", { required: true })}
                className="rounded border px-2 py-1.5"
              >
                <option value="">— select —</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Player name
              <input
                {...register("player_name", { required: true })}
                className="rounded border px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-1">
              Deck name{" "}
              <span className="text-zinc-400">(optional)</span>
              </div>
              <input
                {...register("name")}
                className="rounded border px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-1">
              Placement{" "}
              <span className="text-zinc-400">(optional)</span>
              </div>
              <input
                type="number"
                min={1}
                {...register("placement")}
                className="w-20 rounded border px-2 py-1.5"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="mb-1 text-base font-semibold">2c. Decklist</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Paste raw decklist. Use &quot;Sideboard&quot; on its own line to separate.
          </p>
          <textarea
            {...register("card_list", { required: true })}
            placeholder={"4 Primeval Titan\n4 Cultivate\n...\nSideboard\n3 Acidic Slime"}
            rows={14}
            className="w-full rounded border px-2 py-1.5 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 rounded bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit Deck"}
          </button>
        </section>
      </form>
    </div>
  );
}
