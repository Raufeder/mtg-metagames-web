"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { useAdminStore } from "@/lib/store/adminStore";
import { updateMetagame, deleteMetagame, addSet, removeSet, addBanlist, addRestrictedList, getMetagame } from "@/lib/api/metagames";
import { formatDate } from "@/lib/utils/date";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { SelectField } from "@/app/components/atoms/form_atoms/SelectField";
import { DateField } from "@/app/components/atoms/form_atoms/DateField";
import { TextareaField } from "@/app/components/atoms/form_atoms/TextareaField";
import { AdminTournamentsList } from "./AdminTournamentsList";
import { AdminArchetypesList } from "./AdminArchetypesList";
import { ACCEPTABLE_FORMATS } from "@/lib/constants/formats";

interface MetagameForm {
  name: string;
  start_date: string;
  end_date: string;
  format: string;
}

export function AdminMetagameView() {
  const metagame = useAdminStore((s) => s.metagame);
  const patchMetagame = useAdminStore((s) => s.patchMetagame);
  const setMetagame = useAdminStore((s) => s.setMetagame);
  const { addToast } = useToast();
  const router = useRouter();

  const [editingHero, setEditingHero] = useState(false);
  const [editingBanlist, setEditingBanlist] = useState(false);
  const [editingRestricted, setEditingRestricted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [addingSet, setAddingSet] = useState(false);

  const heroForm = useForm<MetagameForm>({
    defaultValues: metagame
      ? { name: metagame.name, start_date: metagame.start_date, end_date: metagame.end_date, format: metagame.format }
      : undefined,
  });

  const banlistForm = useForm<{ card_list: string }>({
    defaultValues: { card_list: metagame?.banlist.map((c) => c.name).join("\n") ?? "" },
  });

  const restrictedForm = useForm<{ card_list: string }>({
    defaultValues: { card_list: metagame?.restrictedlist.map((c) => c.name).join("\n") ?? "" },
  });

  if (!metagame) return null;

  async function saveHero(values: MetagameForm) {
    const dirty = Object.fromEntries(
      Object.keys(heroForm.formState.dirtyFields).map((k) => [k, values[k as keyof MetagameForm]])
    ) as Partial<MetagameForm>;
    if (Object.keys(dirty).length === 0) { setEditingHero(false); return; }
    const updated = await updateMetagame(metagame!.id, dirty);
    patchMetagame(updated);
    setEditingHero(false);
    addToast("Metagame updated", "success");
  }

  async function handleAddSet() {
    if (!newSetName.trim()) return;
    setAddingSet(true);
    try {
      await addSet(metagame!.id, newSetName.trim());
      const updated = await getMetagame(metagame!.id);
      setMetagame(updated);
      addToast(`Added set: ${newSetName}`, "success");
      setNewSetName("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add set", "error");
    } finally {
      setAddingSet(false);
    }
  }

  async function handleRemoveSet(setCode: string) {
    await removeSet(metagame!.id, setCode);
    const updated = await getMetagame(metagame!.id);
    setMetagame(updated);
    addToast("Set removed", "success");
  }

  async function saveBanlist(values: { card_list: string }) {
    await addBanlist(metagame!.id, values.card_list);
    const updated = await getMetagame(metagame!.id);
    setMetagame(updated);
    setEditingBanlist(false);
    addToast("Banlist updated", "success");
  }

  async function saveRestricted(values: { card_list: string }) {
    await addRestrictedList(metagame!.id, values.card_list);
    const updated = await getMetagame(metagame!.id);
    setMetagame(updated);
    setEditingRestricted(false);
    addToast("Restricted list updated", "success");
  }
  
  return (
    <div className="space-y-10">
      {/* Hero section */}
      <section className="rounded-xl border border-border bg-bg-light p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">{metagame.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {formatDate(metagame.start_date)} — {formatDate(metagame.end_date)}
              <span className="ml-2 rounded-full bg-bg-dark px-2 py-0.5 text-xs">{metagame.format}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingHero(!editingHero)} className="gap-1.5">
              <Icon name="Edit2" size={13} /> Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)} className="gap-1.5">
              <Icon name="Trash2" size={13} /> Delete
            </Button>
          </div>
        </div>

        {/* Hero edit form */}
        <div className={`grid transition-all duration-200 ${editingHero ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <form onSubmit={heroForm.handleSubmit(saveHero)} className="border-t border-border pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Name" registration={heroForm.register("name")} />
                <SelectField label="Format" registration={heroForm.register("format")} options={ACCEPTABLE_FORMATS} />
                <DateField label="Start date" registration={heroForm.register("start_date")} />
                <DateField label="End date" registration={heroForm.register("end_date")} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="success" loading={heroForm.formState.isSubmitting} className="gap-1.5">
                  <Icon name="Check" size={13} /> Save
                </Button>
                <Button onClick={() => setEditingHero(false)} className="gap-1.5">
                  <Icon name="X" size={13} /> Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sets */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Legal Sets</p>
          <div className="flex flex-wrap gap-2 items-center">
            {metagame.sets.map((s) => (
              <span key={s.set_code} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 text-xs">
                {s.name}
                <button onClick={() => handleRemoveSet(s.set_code)} className="text-text-muted hover:text-danger transition-colors">
                  <Icon name="X" size={11} />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-2">
              <input
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSet())}
                placeholder="Add set…"
                className="rounded border border-border bg-bg px-2 py-1 text-xs outline-none focus:border-primary w-32"
              />
              <Button onClick={handleAddSet} disabled={!newSetName.trim()} loading={addingSet} className="!py-1 !px-2 text-xs gap-1">
                <Icon name="Plus" size={11} /> Add
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Tournaments</h2>
        <AdminTournamentsList metagameId={metagame.id} tournaments={metagame.tournaments} />
      </section>

      {/* Archetypes */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Archetypes</h2>
        <AdminArchetypesList metagameId={metagame.id} archetypes={metagame.archetypes} />
      </section>

      {/* Format Card Restrictions */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-text">Format Card Restrictions</h2>

        {/* Banlist */}
        <div className="rounded-xl border border-border bg-bg-light p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Banned</h3>
            <Button onClick={() => setEditingBanlist(!editingBanlist)} className="gap-1.5 !py-1 !px-2.5 text-xs">
              <Icon name="Edit2" size={12} /> Edit
            </Button>
          </div>
          {!editingBanlist && (
            <ul className="columns-2 gap-4 sm:columns-3">
              {metagame.banlist.map((c) => <li key={c.id} className="mb-1 text-sm text-text">{c.name}</li>)}
              {metagame.banlist.length === 0 && <li className="text-sm text-text-muted">None</li>}
            </ul>
          )}
          <div className={`grid transition-all duration-200 ${editingBanlist ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <form onSubmit={banlistForm.handleSubmit(saveBanlist)} className="space-y-3 pt-1">
                <TextareaField label="" registration={banlistForm.register("card_list")} hint="One card per line" rows={6} mono />
                <div className="flex gap-2">
                  <Button type="submit" variant="success" loading={banlistForm.formState.isSubmitting} className="gap-1.5">
                    <Icon name="Check" size={13} /> Save
                  </Button>
                  <Button onClick={() => setEditingBanlist(false)} className="gap-1.5">
                    <Icon name="X" size={13} /> Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Restricted list */}
        <div className="rounded-xl border border-border bg-bg-light p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Restricted</h3>
            <Button onClick={() => setEditingRestricted(!editingRestricted)} className="gap-1.5 !py-1 !px-2.5 text-xs">
              <Icon name="Edit2" size={12} /> Edit
            </Button>
          </div>
          {!editingRestricted && (
            <ul className="columns-2 gap-4 sm:columns-3">
              {metagame.restrictedlist.map((c) => <li key={c.id} className="mb-1 text-sm text-text">{c.name}</li>)}
              {metagame.restrictedlist.length === 0 && <li className="text-sm text-text-muted">None</li>}
            </ul>
          )}
          <div className={`grid transition-all duration-200 ${editingRestricted ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <form onSubmit={restrictedForm.handleSubmit(saveRestricted)} className="space-y-3 pt-1">
                <TextareaField label="" registration={restrictedForm.register("card_list")} hint="One card per line" rows={6} mono />
                <div className="flex gap-2">
                  <Button type="submit" variant="success" loading={restrictedForm.formState.isSubmitting} className="gap-1.5">
                    <Icon name="Check" size={13} /> Save
                  </Button>
                  <Button onClick={() => setEditingRestricted(false)} className="gap-1.5">
                    <Icon name="X" size={13} /> Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={confirmDelete}
        title="Delete Metagame"
        message={`This will permanently delete "${metagame.name}" and all associated data.`}
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteMetagame(metagame.id);
          router.push("/admin");
          addToast("Metagame deleted", "success");
        }}
      />
    </div>
  );
}
