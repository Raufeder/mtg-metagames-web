"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { getArchetype } from "@/lib/api/archetypes";
import { getMetagame } from "@/lib/api/metagames";
import { updateDeck, deleteDeck } from "@/lib/api/decks";
import { useToast } from "@/lib/toast/context";
import { formatDate } from "@/lib/utils/date";
import type { ArchetypeDetail, ArchetypeDeck } from "@/lib/api/archetypes";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { NumberField } from "@/app/components/atoms/form_atoms/NumberField";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

interface Props {
  params: Promise<{ id: string; archetypeId: string }>;
}

interface DeckForm {
  player_name: string;
  name: string;
  placement: number;
}

export default function AdminArchetypePage({ params }: Props) {
  const { id: metagameId, archetypeId } = use(params);
  const { addToast } = useToast();

  const [archetype, setArchetype] = useState<ArchetypeDetail | null>(null);
  const [metagameName, setMetagameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchetypeDeck | null>(null);

  useEffect(() => {
    Promise.all([getArchetype(metagameId, archetypeId), getMetagame(metagameId)])
      .then(([a, m]) => { setArchetype(a); setMetagameName(m.name); })
      .finally(() => setLoading(false));
  }, [metagameId, archetypeId]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><PageSpinner className="h-16 w-16 text-text-muted" /></div>;
  if (!archetype) return <p className="p-10 text-center text-sm text-danger">Not found</p>;

  const sorted = [...archetype.decks].sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999));

  async function handleDeleteDeck(deck: ArchetypeDeck) {
    await deleteDeck(deck.id);
    setArchetype((prev) => prev ? { ...prev, decks: prev.decks.filter((d) => d.id !== deck.id) } : prev);
    setDeleteTarget(null);
    addToast("Deck deleted", "success");
  }

  async function handleUpdateDeck(deck: ArchetypeDeck, dirty: Partial<DeckForm>) {
    const updated = await updateDeck(deck.id, dirty);
    setArchetype((prev) => prev ? { ...prev, decks: prev.decks.map((d) => d.id === deck.id ? { ...d, ...updated } : d) } : prev);
    setEditingDeckId(null);
    addToast("Deck updated", "success");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <nav className="text-xs text-text-muted flex items-center gap-2">
        <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
        <span>/</span>
        <Link href={`/admin/metagames/${metagameId}`} className="hover:text-text transition-colors">{metagameName}</Link>
        <span>/</span>
        <span className="text-text">{archetype.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <ColorPips colors={archetype.colors} size="md" />
        <h1 className="text-2xl font-semibold text-text">{archetype.name}</h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-text">Decks</h2>
        {sorted.map((deck) => (
          <div key={deck.id} className="rounded-lg border border-border bg-bg-light">
            <div className="flex items-center justify-between px-4 py-3">
              <Link
                href={`/admin/metagames/${metagameId}/tournaments/${deck.tournament_id}/${deck.id}`}
                className="flex-1 hover:text-primary transition-colors"
              >
                <p className="text-sm font-medium text-text">#{deck.placement} · {deck.player_name}{deck.name ? ` — ${deck.name}` : ""}</p>
                <p className="text-xs text-text-muted">{deck.tournaments.name} · {formatDate(deck.tournaments.start_date)}</p>
              </Link>
              <div className="flex gap-2 ml-4">
                <Button onClick={() => setEditingDeckId(deck.id)} className="gap-1.5 !px-2.5 !py-1"><Icon name="Edit2" size={13} /> Edit</Button>
                <Button variant="danger" onClick={() => setDeleteTarget(deck)} className="gap-1.5 !px-2.5 !py-1"><Icon name="Trash2" size={13} /> Delete</Button>
              </div>
            </div>
            <div className={`grid transition-all duration-200 ${editingDeckId === deck.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <DeckEditForm
                  deck={deck}
                  onSave={(dirty) => handleUpdateDeck(deck, dirty)}
                  onCancel={() => setEditingDeckId(null)}
                />
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-text-muted">No decks yet.</p>}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Deck"
        message={`This will permanently delete "${deleteTarget?.player_name}'s deck".`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteDeck(deleteTarget!)}
      />
    </div>
  );
}

function DeckEditForm({ deck, onSave, onCancel }: {
  deck: ArchetypeDeck;
  onSave: (dirty: Partial<DeckForm>) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { isSubmitting, dirtyFields } } = useForm<DeckForm>({
    defaultValues: { player_name: deck.player_name, name: deck.name ?? "", placement: deck.placement ?? undefined },
  });

  async function onSubmit(values: DeckForm) {
    const dirty = Object.fromEntries(Object.keys(dirtyFields).map((k) => [k, values[k as keyof DeckForm]])) as Partial<DeckForm>;
    await onSave(dirty);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-t border-border px-4 py-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Player name" registration={register("player_name")} />
        <TextField label="Deck name" registration={register("name")} optional />
        <NumberField label="Placement" registration={register("placement")} min={1} optional />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5"><Icon name="Check" size={13} /> Save</Button>
        <Button onClick={onCancel} className="gap-1.5"><Icon name="X" size={13} /> Cancel</Button>
      </div>
    </form>
  );
}
