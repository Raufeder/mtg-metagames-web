"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { useAdminStore } from "@/lib/store/adminStore";
import { createTournament, updateTournament, deleteTournament } from "@/lib/api/tournaments";
import type { Tournament } from "@/lib/api/tournaments";
import { formatDate } from "@/lib/utils/date";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { DateField } from "@/app/components/atoms/form_atoms/DateField";

interface Props {
  metagameId: string;
  tournaments: Tournament[];
}

interface TournamentForm {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

export function AdminTournamentsList({ metagameId, tournaments }: Props) {
  const { addTournament, updateTournament: storeUpdate, removeTournament } = useAdminStore();
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="space-y-1">
      {tournaments.map((t) => (
        <TournamentRow
          key={t.id}
          tournament={t}
          metagameId={metagameId}
          isEditing={editingId === t.id}
          onEdit={() => setEditingId(t.id)}
          onCancelEdit={() => setEditingId(null)}
          onSave={async (dirty) => {
            const updated = await updateTournament(metagameId, t.id, dirty);
            storeUpdate(t.id, updated);
            setEditingId(null);
            addToast("Tournament updated", "success");
          }}
          onDelete={() => setDeleteTarget(t)}
        />
      ))}

      {/* Add new tournament inline */}
      <div className={`grid transition-all duration-200 ${addingNew ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <AddTournamentForm
            onCancel={() => setAddingNew(false)}
            onSave={async (data) => {
              const t = await createTournament(metagameId, data);
              addTournament(t);
              setAddingNew(false);
              addToast("Tournament added", "success");
            }}
          />
        </div>
      </div>

      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors pt-1"
        >
          <Icon name="Plus" size={14} /> Add tournament
        </button>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Tournament"
        message={`This will permanently delete "${deleteTarget?.name}".`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteTournament(metagameId, deleteTarget!.id);
          removeTournament(deleteTarget!.id);
          setDeleteTarget(null);
          addToast("Tournament deleted", "success");
        }}
      />
    </div>
  );
}

function TournamentRow({
  tournament: t,
  metagameId,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  tournament: Tournament;
  metagameId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (dirty: Partial<TournamentForm>) => Promise<void>;
  onDelete: () => void;
}) {
  const { register, handleSubmit, formState: { isSubmitting, dirtyFields } } = useForm<TournamentForm>({
    defaultValues: { name: t.name, start_date: t.start_date, end_date: t.end_date, location: t.location },
  });

  async function onSubmit(values: TournamentForm) {
    const dirty = Object.fromEntries(
      Object.keys(dirtyFields).map((k) => [k, values[k as keyof TournamentForm]])
    ) as Partial<TournamentForm>;
    await onSave(dirty);
  }

  return (
    <div className="rounded-lg border border-border bg-bg-light">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={`/admin/metagames/${metagameId}/tournaments/${t.id}`}
          className="flex-1 hover:text-primary transition-colors"
        >
          <p className="text-sm font-medium text-text">{t.name}</p>
          <p className="text-xs text-text-muted">{t.location} · {formatDate(t.start_date)}{t.start_date !== t.end_date ? ` – ${formatDate(t.end_date)}` : ""}</p>
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <Button onClick={onEdit} className="gap-1.5 !px-2.5 !py-1">
            <Icon name="Edit2" size={13} /> Edit
          </Button>
          <Button variant="danger" onClick={onDelete} className="gap-1.5 !px-2.5 !py-1">
            <Icon name="Trash2" size={13} /> Delete
          </Button>
        </div>
      </div>

      <div className={`grid transition-all duration-200 ${isEditing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-border px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Name" registration={register("name")} />
              <TextField label="Location" registration={register("location")} />
              <DateField label="Start date" registration={register("start_date")} />
              <DateField label="End date" registration={register("end_date")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5">
                <Icon name="Check" size={13} /> Save
              </Button>
              <Button onClick={onCancelEdit} className="gap-1.5">
                <Icon name="X" size={13} /> Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddTournamentForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (data: TournamentForm) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TournamentForm>();

  return (
    <form onSubmit={handleSubmit(onSave)} className="rounded-lg border border-primary bg-bg-light px-4 py-4 mb-2 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">New Tournament</p>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Name" registration={register("name", { required: true })} />
        <TextField label="Location" registration={register("location", { required: true })} />
        <DateField label="Start date" registration={register("start_date", { required: true })} />
        <DateField label="End date" registration={register("end_date", { required: true })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5">
          <Icon name="Plus" size={13} /> Add
        </Button>
        <Button onClick={onCancel} className="gap-1.5">
          <Icon name="X" size={13} /> Cancel
        </Button>
      </div>
    </form>
  );
}
