"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getArchetypes, updateArchetypeGlobal, deleteArchetypeGlobal } from "@/lib/api/archetypes";
import type { Archetype } from "@/lib/api/archetypes";
import { useToast } from "@/lib/toast/context";
import { ColorPips } from "@/app/components/metagames/ColorPips";
import { ColorPicker } from "@/app/components/atoms/form_atoms/ColorPicker";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { Button } from "@/app/components/atoms/Button";
import { Icon } from "@/app/components/atoms/Icon";
import { ConfirmModal } from "@/app/components/atoms/ConfirmModal";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

interface Props {
  params: Promise<{ archetypeId: string }>;
}

interface ArchetypeForm {
  name: string;
}

export default function AdminArchetypeEditPage({ params }: Props) {
  const { archetypeId } = use(params);
  const { addToast } = useToast();
  const router = useRouter();

  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting, dirtyFields } } = useForm<ArchetypeForm>();

  useEffect(() => {
    getArchetypes().then((all) => {
      const found = all.find((a) => a.id === archetypeId) ?? null;
      setArchetype(found);
      if (found) {
        setColors(found.colors);
        reset({ name: found.name });
      }
    }).finally(() => setLoading(false));
  }, [archetypeId, reset]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PageSpinner className="h-16 w-16 text-text-muted" />
      </div>
    );
  }

  if (!archetype) {
    return <p className="p-10 text-center text-sm text-danger">Archetype not found</p>;
  }

  async function onSubmit(values: ArchetypeForm) {
    const dirty: Partial<{ name: string; colors: string[] }> = {};
    if (dirtyFields.name) dirty.name = values.name;
    if (JSON.stringify(colors) !== JSON.stringify(archetype!.colors)) dirty.colors = colors;
    if (Object.keys(dirty).length === 0) {
      addToast("No changes to save", "success");
      return;
    }
    const updated = await updateArchetypeGlobal(archetypeId, dirty);
    setArchetype(updated);
    setColors(updated.colors);
    reset({ name: updated.name });
    addToast("Archetype updated", "success");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <nav className="text-xs text-text-muted flex items-center gap-2">
        <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/archetypes" className="hover:text-text transition-colors">Archetypes</Link>
        <span>/</span>
        <span className="text-text">{archetype.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <ColorPips colors={archetype.colors} size="md" />
        <h1 className="text-2xl font-semibold text-text">{archetype.name}</h1>
      </div>

      <section className="rounded-xl border border-border bg-bg-light p-6 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField label="Name" registration={register("name", { required: true })} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Colors</label>
            <ColorPicker value={colors} onChange={setColors} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="success" loading={isSubmitting} className="gap-1.5">
              <Icon name="Check" size={13} /> Save
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              className="gap-1.5 ml-auto"
            >
              <Icon name="Trash2" size={13} /> Delete Archetype
            </Button>
          </div>
        </form>
      </section>

      <ConfirmModal
        open={confirmDelete}
        title="Delete Archetype"
        message={`This will permanently delete "${archetype.name}" and remove it from all metagames.`}
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteArchetypeGlobal(archetypeId);
          router.push("/admin/archetypes");
          addToast("Archetype deleted", "success");
        }}
      />
    </div>
  );
}
