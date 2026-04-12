"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { createMetagame } from "@/lib/api/metagames";
import { useToast } from "@/lib/toast/context";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { DateField } from "@/app/components/atoms/form_atoms/DateField";
import { Button } from "@/app/components/atoms/Button";
import { ACCEPTABLE_FORMATS } from "@/lib/constants/formats";

interface FormValues {
  name: string;
  start_date: string;
  end_date: string;
  format: string;
}

export default function NewMetagamePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { format: "Standard" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const m = await createMetagame(values);
      addToast(`Created "${m.name}"`, "success");
      router.push(`/admin/metagames/${m.id}`);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to create metagame", "error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
      <div>
        <Link href="/admin" className="text-xs text-text-muted hover:text-text">← Admin</Link>
        <h1 className="mt-2 text-2xl font-semibold text-text">New Metagame</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <TextField label="Name" registration={register("name", { required: true })} placeholder="e.g. Scars of Mirrodin Standard" />
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Format</label>
          <select
            {...register("format", { required: true })}
            className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            {ACCEPTABLE_FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <DateField label="Start date" registration={register("start_date", { required: true })} />
        <DateField label="End date" registration={register("end_date", { required: true })} />
        <Button type="submit" loading={isSubmitting}>Create Metagame</Button>
      </form>
    </div>
  );
}
