"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { createMetagame, addSet, addBanlist, type Metagame } from "@/lib/api/metagames";
import { TournamentForm } from "./TournamentForm";
import { createTournament, type Tournament } from "@/lib/api/tournaments";

interface MetagameFormValues {
  start_date: string;
  end_date: string;
}

interface Props {
  metagame: Metagame | null;
  onMetagameCreated: (m: Metagame) => void;
  tournaments: Tournament[];
  onTournamentCreated: (t: Tournament) => void;
}

export function MetagameSetupForm({
  metagame,
  onMetagameCreated,
  tournaments,
  onTournamentCreated,
}: Props) {
  const { addToast } = useToast();

  // Metagame creation form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MetagameFormValues>();

  // Set code — simple controlled input, not a full form
  const [setCode, setSetCode] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [addedSets, setAddedSets] = useState<string[]>([]);

  // Banlist
  const [banlist, setBanlist] = useState("");
  const [addingBanlist, setAddingBanlist] = useState(false);

  async function onCreateMetagame(values: MetagameFormValues) {
    try {
      const data = await createMetagame(values);
      onMetagameCreated(data);
      addToast(`Metagame #${data.id} created`, "success");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to create metagame", "error");
    }
  }

  async function handleAddSet() {
    if (!metagame || !setCode.trim()) return;
    setAddingSet(true);
    try {
      const code = setCode.trim().toUpperCase();
      const data = await addSet(metagame.id, code);
      setAddedSets((prev) => [...prev, data.name ?? code]);
      addToast(`Added set: ${data.name ?? code}`, "success");
      setSetCode("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add set", "error");
    } finally {
      setAddingSet(false);
    }
  }

  async function handleAddBanlist() {
    if (!metagame || !banlist.trim()) return;
    setAddingBanlist(true);
    try {
      await addBanlist(metagame.id, banlist.trim());
      addToast("Banlist submitted", "success");
      setBanlist("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to submit banlist", "error");
    } finally {
      setAddingBanlist(false);
    }
  }

  async function handleCreateTournament(data: {
    name: string;
    start_date: string;
    end_date: string;
    location: string;
  }) {
    if (!metagame) return;
    const t = await createTournament(metagame.id, data);
    onTournamentCreated(t);
    addToast(`Tournament "${t.name}" created`, "success");
  }

  return (
    <div className="space-y-8">
      {/* 1a. Create Metagame */}
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-base font-semibold">1a. Create Metagame</h2>
        {metagame ? (
          <p className="text-sm text-green-700">
            ✓ Active metagame #{metagame.id} ({metagame.start_date} → {metagame.end_date})
          </p>
        ) : (
          <form onSubmit={handleSubmit(onCreateMetagame)} className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Start date
              <input
                type="date"
                {...register("start_date", { required: true })}
                className="rounded border px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              End date
              <input
                type="date"
                {...register("end_date", { required: true })}
                className="rounded border px-2 py-1.5"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-end rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </form>
        )}
      </section>

      {/* 1b. Legal Sets */}
      <section className={`rounded-lg border p-5 ${!metagame ? "opacity-40 pointer-events-none" : ""}`}>
        <h2 className="mb-4 text-base font-semibold">1b. Add Legal Sets</h2>
        {addedSets.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {addedSets.map((name) => (
              <span
                key={name}
                className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                {name}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <input
            value={setCode}
            onChange={(e) => setSetCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSet()}
            placeholder="e.g. ZEN"
            className="w-28 rounded border px-2 py-1.5 text-sm uppercase"
          />
          <button
            onClick={handleAddSet}
            disabled={!setCode.trim() || addingSet}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {addingSet ? "Adding…" : "Add Set"}
          </button>
        </div>
      </section>

      {/* 1c. Banlist */}
      <section className={`rounded-lg border p-5 ${!metagame ? "opacity-40 pointer-events-none" : ""}`}>
        <h2 className="mb-1 text-base font-semibold">
          1c. Banlist{" "}
          <span className="text-sm font-normal text-zinc-400">(optional)</span>
        </h2>
        <p className="mb-3 text-xs text-zinc-500">One card name per line</p>
        <textarea
          value={banlist}
          onChange={(e) => setBanlist(e.target.value)}
          placeholder={"Ancestral Recall\nBlack Lotus\nMox Pearl"}
          rows={5}
          className="w-full rounded border px-2 py-1.5 font-mono text-sm"
        />
        <button
          onClick={handleAddBanlist}
          disabled={!banlist.trim() || addingBanlist}
          className="mt-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {addingBanlist ? "Submitting…" : "Submit Banlist"}
        </button>
      </section>

      {/* 1d. Tournaments */}
      <section className={`rounded-lg border p-5 ${!metagame ? "opacity-40 pointer-events-none" : ""}`}>
        <h2 className="mb-4 text-base font-semibold">1d. Add Tournaments</h2>
        {tournaments.length > 0 && (
          <ul className="mb-4 space-y-1 text-sm text-zinc-600">
            {tournaments.map((t) => (
              <li key={t.id}>
                #{t.id} — {t.name}
              </li>
            ))}
          </ul>
        )}
        <TournamentForm onSubmit={handleCreateTournament} disabled={!metagame} />
      </section>
    </div>
  );
}
