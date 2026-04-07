"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { addArchetype, type Archetype } from "@/lib/api/archetypes";
import { createDeck, addCards } from "@/lib/api/decks";
import type { Metagame } from "@/lib/api/metagames";
import type { Tournament } from "@/lib/api/tournaments";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { NumberField } from "@/app/components/atoms/form_atoms/NumberField";
import { TextareaField } from "@/app/components/atoms/form_atoms/TextareaField";
import { ColorPicker } from "@/app/components/atoms/form_atoms/ColorPicker";
import { Button } from "@/app/components/atoms/Button";

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
  const [archetypeColors, setArchetypeColors] = useState<string[]>([]);
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
      const data = await addArchetype(metagame.id, newArchetypeName.trim(), archetypeColors);
      setArchetypes((prev) =>
        prev.find((a) => a.id === data.id) ? prev : [...prev, data]
      );
      setValue("archetype_id", String(data.id));
      addToast(`Archetype "${data.name}" ready`, "success");
      setNewArchetypeName("");
      setArchetypeColors([]);
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
        <h2 className="mb-4 text-base font-semibold">2a. Archetype (Must select the right archetype for each deck you upload)</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              value={newArchetypeName}
              onChange={(e) => setNewArchetypeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddArchetype()}
              placeholder="New archetype name"
              className="rounded border px-2 py-1.5 text-sm"
            />
            <Button
              onClick={handleAddArchetype}
              disabled={!newArchetypeName.trim()}
              loading={addingArchetype}
            >
              Add / Get Archetype
            </Button>
          </div>
          <ColorPicker value={archetypeColors} onChange={setArchetypeColors} />
        </div>
      </section>

      {/* 2b & 2c. Deck form */}
      <form onSubmit={handleSubmit(onSubmitDeck)} className="space-y-6">
        <section className="rounded-lg border p-5">
          <h2 className="mb-4 text-base font-semibold">2b. Deck Info</h2>
          <div className="flex flex-wrap gap-4">
            {archetypes.length > 0 && (
              <label className="flex flex-col gap-1 text-sm">
                Archetype
                <select
                  {...register("archetype_id", { required: true })}
                  className="rounded border px-2 py-1.5 text-sm"
                  onChange={(e) => {
                    setValue("archetype_id", e.target.value);
                    const match = archetypes.find((a) => String(a.id) === e.target.value);
                    if (match) setValue("name", match.name);
                  }}
                >
                  <option value="">— select —</option>
                  {archetypes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.colors.length > 0 ? `(${a.colors.join("")})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
            <TextField
              label="Player name"
              registration={register("player_name", { required: true })}
            />
            <TextField
              label="Deck name"
              registration={register("name")}
              optional
            />
            <NumberField
              label="Placement"
              registration={register("placement")}
              optional
              min={1}
            />
          </div>
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="mb-4 text-base font-semibold">2c. Decklist</h2>
          <TextareaField
            label=""
            registration={register("card_list", { required: true })}
            placeholder={"4 Primeval Titan\n4 Cultivate\n...\nSideboard\n3 Acidic Slime"}
            hint='Use "Sideboard" on its own line to separate.'
            rows={14}
            mono
          />
          <Button type="submit" variant="success" loading={isSubmitting} className="mt-3">
            Submit Deck
          </Button>
        </section>
      </form>
    </div>
  );
}
