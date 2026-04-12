"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getTournament } from "@/lib/api/tournaments";
import { updateDeck, deleteDeck, createDeck } from "@/lib/api/decks";
import { getMetagame } from "@/lib/api/metagames";
import { useAdminStore } from "@/lib/store/adminStore";
import { useToast } from "@/lib/toast/context";
import { formatDate } from "@/lib/utils/date";
import type { TournamentDetail, TournamentDeck } from "@/lib/api/tournaments";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { NumberField } from "@/app/components/atoms/form_atoms/NumberField";
import { SelectField } from "@/app/components/atoms/form_atoms/SelectField";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

interface Props {
  params: Promise<{ id: string; tournamentId: string }>;
}

interface DeckForm {
  player_name: string;
  name: string;
  placement: number;
}

export default function AdminTournamentPage({ params }: Props) {
  const { id: metagameId, tournamentId } = use(params);
  const { addToast } = useToast();
  const router = useRouter();
  const setMetagame = useAdminStore((s) => s.setMetagame);

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [metagameName, setMetagameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TournamentDeck | null>(null);
  const [addingDeck, setAddingDeck] = useState(false);

  useEffect(() => {
    Promise.all([getTournament(metagameId, tournamentId), getMetagame(metagameId)])
      .then(([t, m]) => { setTournament(t); setMetagameName(m.name); setMetagame(m); })
      .finally(() => setLoading(false));
  }, [metagameId, tournamentId, setMetagame]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><PageSpinner className="h-16 w-16 text-text-muted" /></div>;
  if (!tournament) return <p className="p-10 text-center text-sm text-danger">Not found</p>;

  const sorted = [...tournament.decks].sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999));

  async function handleDeleteDeck(deck: TournamentDeck) {
    await deleteDeck(deck.id);
    setTournament((prev) => prev ? { ...prev, decks: prev.decks.filter((d) => d.id !== deck.id) } : prev);
    setDeleteTarget(null);
    addToast("Deck deleted", "success");
  }

  async function handleUpdateDeck(deck: TournamentDeck, dirty: Partial<DeckForm>) {
    const updated = await updateDeck(deck.id, dirty);
    setTournament((prev) => prev ? { ...prev, decks: prev.decks.map((d) => d.id === deck.id ? { ...d, ...updated } : d) } : prev);
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
        <span className="text-text">{tournament.name}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold text-text">{tournament.name}</h1>
        <p className="text-sm text-text-muted mt-1">
          {tournament.location} · {formatDate(tournament.start_date)}{tournament.start_date !== tournament.end_date ? ` – ${formatDate(tournament.end_date)}` : ""}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-text">Decks</h2>

        {sorted.map((deck) => (
          <DeckRow
            key={deck.id}
            deck={deck}
            metagameId={metagameId}
            tournamentId={tournamentId}
            isEditing={editingDeckId === deck.id}
            onEdit={() => setEditingDeckId(deck.id)}
            onCancelEdit={() => setEditingDeckId(null)}
            onSave={(dirty) => handleUpdateDeck(deck, dirty)}
            onDelete={() => setDeleteTarget(deck)}
          />
        ))}

        {/* Add deck form */}
        <div className={`grid transition-all duration-200 ${addingDeck ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <AddDeckForm
              tournamentId={tournamentId}
              onCancel={() => setAddingDeck(false)}
              onSave={async (deck) => {
                setTournament((prev) => prev ? { ...prev, decks: [...prev.decks, deck as TournamentDeck] } : prev);
                setAddingDeck(false);
                addToast("Deck added", "success");
              }}
            />
          </div>
        </div>

        {!addingDeck && (
          <button onClick={() => setAddingDeck(true)} className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors pt-1">
            <Icon name="Plus" size={14} /> Add deck
          </button>
        )}
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

function DeckRow({ deck, metagameId, tournamentId, isEditing, onEdit, onCancelEdit, onSave, onDelete }: {
  deck: TournamentDeck;
  metagameId: string;
  tournamentId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (dirty: Partial<DeckForm>) => Promise<void>;
  onDelete: () => void;
}) {
  const { register, handleSubmit, formState: { isSubmitting, dirtyFields } } = useForm<DeckForm>({
    defaultValues: { player_name: deck.player_name, name: deck.name ?? "", placement: deck.placement ?? undefined },
  });

  async function onSubmit(values: DeckForm) {
    const dirty = Object.fromEntries(Object.keys(dirtyFields).map((k) => [k, values[k as keyof DeckForm]])) as Partial<DeckForm>;
    await onSave(dirty);
  }

  return (
    <div className="rounded-lg border border-border bg-bg-light">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/admin/metagames/${metagameId}/tournaments/${tournamentId}/${deck.id}`} className="flex-1 hover:text-primary transition-colors">
          <p className="text-sm font-medium text-text">#{deck.placement} · {deck.player_name}{deck.name ? ` — ${deck.name}` : ""}</p>
          <p className="text-xs text-text-muted">{deck.archetypes.name}</p>
        </Link>
        <div className="flex gap-2 ml-4">
          <Button onClick={onEdit} className="gap-1.5 !px-2.5 !py-1"><Icon name="Edit2" size={13} /> Edit</Button>
          <Button variant="danger" onClick={onDelete} className="gap-1.5 !px-2.5 !py-1"><Icon name="Trash2" size={13} /> Delete</Button>
        </div>
      </div>
      <div className={`grid transition-all duration-200 ${isEditing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-border px-4 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <TextField label="Player name" registration={register("player_name")} />
              <TextField label="Deck name" registration={register("name")} optional />
              <NumberField label="Placement" registration={register("placement")} min={1} optional />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5"><Icon name="Check" size={13} /> Save</Button>
              <Button onClick={onCancelEdit} className="gap-1.5"><Icon name="X" size={13} /> Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddDeckForm({ tournamentId, onCancel, onSave }: {
  tournamentId: string;
  onCancel: () => void;
  onSave: (deck: unknown) => Promise<void>;
}) {
  const { addToast } = useToast();
  const archetypes = useAdminStore((s) => s.metagame?.archetypes ?? []);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<DeckForm & { archetype_id: string }>();

  const archetypeOptions = archetypes.map((a) => ({ value: a.id, label: a.name }));

  async function onSubmit(values: DeckForm & { archetype_id: string }) {
    try {
      const deck = await createDeck({ ...values, tournament_id: tournamentId });
      await onSave(deck);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to add deck", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-primary bg-bg-light px-4 py-4 mb-2 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">New Deck</p>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Player name" registration={register("player_name", { required: true })} />
        <SelectField label="Archetype" registration={register("archetype_id", { required: true })} options={archetypeOptions} />
        <TextField label="Deck name" registration={register("name")} optional />
        <NumberField label="Placement" registration={register("placement")} min={1} optional />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5"><Icon name="Plus" size={13} /> Add</Button>
        <Button onClick={onCancel} className="gap-1.5"><Icon name="X" size={13} /> Cancel</Button>
      </div>
    </form>
  );
}
