"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { useAdminStore } from "@/lib/store/adminStore";
import { addArchetype, linkArchetype, getArchetypes, updateArchetype, deleteArchetype } from "@/lib/api/archetypes";
import type { Archetype } from "@/lib/api/archetypes";
import type { MetagameArchetype } from "@/lib/api/metagames";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { ColorPicker } from "@/app/components/atoms/form_atoms/ColorPicker";
import { ColorPips } from "@/app/components/metagames/ColorPips";

interface Props {
  metagameId: string;
  archetypes: MetagameArchetype[];
}

interface ArchetypeForm {
  name: string;
}

export function AdminArchetypesList({ metagameId, archetypes }: Props) {
  const { addArchetype: storeAdd, updateArchetype: storeUpdate, removeArchetype } = useAdminStore();
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MetagameArchetype | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [linkingExisting, setLinkingExisting] = useState(false);
  const [allArchetypes, setAllArchetypes] = useState<Archetype[]>([]);
  const [archetypeSearch, setArchetypeSearch] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (linkingExisting && allArchetypes.length === 0) {
      getArchetypes().then(setAllArchetypes).catch(() => {});
    }
  }, [linkingExisting, allArchetypes.length]);

  const existingIds = new Set(archetypes.map((a) => a.id));
  const filteredArchetypes = allArchetypes
    .filter((a) => !existingIds.has(a.id))
    .filter((a) => a.name.toLowerCase().includes(archetypeSearch.toLowerCase()));

  async function handleLink(archetype: Archetype) {
    setLinking(true);
    try {
      const linked = await linkArchetype(metagameId, archetype.id);
      storeAdd(linked);
      addToast(`${archetype.name} linked`, "success");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to link archetype", "error");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="space-y-1">
      {archetypes.map((a) => (
        <ArchetypeRow
          key={a.id}
          archetype={a}
          metagameId={metagameId}
          isEditing={editingId === a.id}
          onEdit={() => setEditingId(a.id)}
          onCancelEdit={() => setEditingId(null)}
          onSave={async (name, colors) => {
            const dirty: Partial<{ name: string; colors: string[] }> = {};
            if (name !== a.name) dirty.name = name;
            if (JSON.stringify(colors) !== JSON.stringify(a.colors)) dirty.colors = colors;
            if (Object.keys(dirty).length === 0) { setEditingId(null); return; }
            const updated = await updateArchetype(metagameId, a.id, dirty);
            storeUpdate(a.id, updated);
            setEditingId(null);
            addToast("Archetype updated", "success");
          }}
          onDelete={() => setDeleteTarget(a)}
        />
      ))}

      {/* Add new archetype */}
      <div className={`grid transition-all duration-200 ${addingNew ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <AddArchetypeForm
            onCancel={() => setAddingNew(false)}
            onSave={async (name, colors) => {
              const a = await addArchetype(metagameId, name, colors);
              storeAdd(a);
              setAddingNew(false);
              addToast("Archetype added", "success");
            }}
          />
        </div>
      </div>

      {/* Link existing archetype */}
      <div className={`grid transition-all duration-200 ${linkingExisting ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="rounded-lg border border-primary bg-bg-light px-4 py-4 mb-2 space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Link Existing Archetype</p>
            <input
              value={archetypeSearch}
              onChange={(e) => setArchetypeSearch(e.target.value)}
              placeholder="Search archetypes…"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <ul className="max-h-48 overflow-y-auto space-y-1">
              {filteredArchetypes.length === 0 && (
                <li className="text-sm text-text-muted py-1">
                  {allArchetypes.length === 0 ? "Loading…" : "No archetypes found"}
                </li>
              )}
              {filteredArchetypes.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 py-1">
                  <div className="flex items-center gap-2">
                    <ColorPips colors={a.colors} size="sm" />
                    <span className="text-sm text-text">{a.name}</span>
                  </div>
                  <Button
                    onClick={() => handleLink(a)}
                    loading={linking}
                    className="gap-1 !px-2 !py-0.5 text-xs"
                  >
                    <Icon name="Link" size={11} /> Link
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={() => { setLinkingExisting(false); setArchetypeSearch(""); }} className="gap-1.5">
              <Icon name="X" size={13} /> Cancel
            </Button>
          </div>
        </div>
      </div>

      {!addingNew && !linkingExisting && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <Icon name="Plus" size={14} /> New archetype
          </button>
          {/* <button
            onClick={() => setLinkingExisting(true)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <Icon name="Link" size={14} /> Link existing
          </button> */}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Archetype"
        message={`This will permanently delete "${deleteTarget?.name}".`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteArchetype(metagameId, deleteTarget!.id);
          removeArchetype(deleteTarget!.id);
          setDeleteTarget(null);
          addToast("Archetype deleted", "success");
        }}
      />
    </div>
  );
}

function ArchetypeRow({
  archetype: a,
  metagameId,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  archetype: MetagameArchetype;
  metagameId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (name: string, colors: string[]) => Promise<void>;
  onDelete: () => void;
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ArchetypeForm>({
    defaultValues: { name: a.name },
  });
  const [colors, setColors] = useState(a.colors);

  async function onSubmit(values: ArchetypeForm) {
    await onSave(values.name, colors);
  }

  return (
    <div className="rounded-lg border border-border bg-bg-light">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={`/admin/metagames/${metagameId}/archetypes/${a.id}`}
          className="flex items-center gap-3 flex-1 hover:text-primary transition-colors"
        >
          <ColorPips colors={a.colors} size="sm" />
          <p className="text-sm font-medium text-text">{a.name}</p>
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
            <TextField label="Name" registration={register("name")} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Colors</label>
              <ColorPicker value={colors} onChange={setColors} />
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

function AddArchetypeForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (name: string, colors: string[]) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ArchetypeForm>();
  const [colors, setColors] = useState<string[]>([]);

  return (
    <form onSubmit={handleSubmit((v) => onSave(v.name, colors))} className="rounded-lg border border-primary bg-bg-light px-4 py-4 mb-2 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">New Archetype</p>
      <TextField label="Name" registration={register("name", { required: true })} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Colors</label>
        <ColorPicker value={colors} onChange={setColors} />
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
