"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { createMetagame, addSet, addBanlist, type Metagame } from "@/lib/api/metagames";
import { createTournament, type Tournament } from "@/lib/api/tournaments";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { DateField } from "@/app/components/atoms/form_atoms/DateField";
import { TextareaField } from "@/app/components/atoms/form_atoms/TextareaField";
import { Button } from "@/app/components/atoms/Button";
import { Badge } from "@/app/components/atoms/Badge";
import { TournamentForm } from "./TournamentForm";

interface MetagameFormValues {
  name: string;
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MetagameFormValues>();

  const [setName, setSetName] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [addedSets, setAddedSets] = useState<string[]>([]);

  const {
    register: registerBanlist,
    handleSubmit: handleBanlistSubmit,
    reset: resetBanlist,
    formState: { isSubmitting: isSubmittingBanlist },
  } = useForm<{ card_list: string }>();

  async function onCreateMetagame(values: MetagameFormValues) {
    try {
      const data = await createMetagame(values);
      onMetagameCreated(data);
      addToast(`Metagame "${data.name}" created`, "success");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to create metagame", "error");
    }
  }

  async function handleAddSet() {
    if (!metagame || !setName.trim()) return;
    setAddingSet(true);
    try {
      const data = await addSet(metagame.id, setName.trim());
      setAddedSets((prev) => [...prev, data.name ?? setName]);
      addToast(`Added set: ${data.name ?? setName}`, "success");
      setSetName("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add set", "error");
    } finally {
      setAddingSet(false);
    }
  }

  async function onSubmitBanlist(values: { card_list: string }) {
    if (!metagame) return;
    try {
      await addBanlist(metagame.id, values.card_list.trim());
      addToast("Banlist submitted", "success");
      resetBanlist();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to submit banlist", "error");
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

  const sectionDisabled = !metagame
    ? "opacity-40 pointer-events-none"
    : "";

  return (
    <div className="space-y-8">
      {/* 1a. Create Metagame */}
      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-base font-semibold">1a. Create Metagame</h2>
        {metagame ? (
          <p className="text-sm text-success">
            ✓ {metagame.name} #{metagame.id} ({metagame.start_date} → {metagame.end_date})
          </p>
        ) : (
          <form onSubmit={handleSubmit(onCreateMetagame)} className="flex flex-wrap gap-4">
            <TextField
              label="Name"
              registration={register("name", { required: true })}
              placeholder="e.g. Scars of Mirrodin Block"
            />
            <DateField label="Start date" registration={register("start_date", { required: true })} />
            <DateField label="End date" registration={register("end_date", { required: true })} />
            <Button type="submit" loading={isSubmitting} className="self-end">
              Create
            </Button>
          </form>
        )}
      </section>

      {/* 1b. Legal Sets */}
      <section className={`rounded-lg border p-5 ${sectionDisabled}`}>
        <h2 className="mb-4 text-base font-semibold">1b. Add Legal Sets</h2>
        {addedSets.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {addedSets.map((name) => (
              <Badge key={name} label={name} />
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <input
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSet()}
            placeholder="e.g. Zendikar"
            className="rounded border px-2 py-1.5 text-sm"
          />
          <Button onClick={handleAddSet} disabled={!setName.trim()} loading={addingSet}>
            Add Set
          </Button>
        </div>
      </section>

      {/* 1c. Banlist */}
      <section className={`rounded-lg border p-5 ${sectionDisabled}`}>
        <h2 className="mb-4 text-base font-semibold">
          1c. Banlist{" "}
          <span className="text-sm font-normal text-text-muted">(optional)</span>
        </h2>
        <form onSubmit={handleBanlistSubmit(onSubmitBanlist)} className="space-y-3">
          <TextareaField
            label=""
            registration={registerBanlist("card_list", { required: true })}
            placeholder={"Ancestral Recall\nBlack Lotus\nMox Pearl"}
            hint="One card name per line"
            rows={5}
            mono
          />
          <Button type="submit" loading={isSubmittingBanlist}>
            Submit Banlist
          </Button>
        </form>
      </section>

      {/* 1d. Tournaments */}
      <section className={`rounded-lg border p-5 ${sectionDisabled}`}>
        <h2 className="mb-4 text-base font-semibold">1d. Add Tournaments</h2>
        {tournaments.length > 0 && (
          <ul className="mb-4 space-y-1 text-sm text-text-muted">
            {tournaments.map((t) => (
              <li key={t.id}>#{t.id} — {t.name}</li>
            ))}
          </ul>
        )}
        <TournamentForm onSubmit={handleCreateTournament} disabled={!metagame} />
      </section>
    </div>
  );
}
