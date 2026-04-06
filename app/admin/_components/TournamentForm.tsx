"use client";

import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";

interface TournamentFormValues {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface Props {
  onSubmit: (data: TournamentFormValues) => Promise<void>;
  disabled?: boolean;
}

export function TournamentForm({ onSubmit, disabled }: Props) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TournamentFormValues>();

  async function handleCreate(values: TournamentFormValues) {
    try {
      await onSubmit(values);
      reset();
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Failed to create tournament",
        "error"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(handleCreate)} className="flex flex-wrap gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          {...register("name", { required: true })}
          disabled={disabled}
          placeholder="e.g. SCG Open Pittsburgh"
          className="rounded border px-2 py-1.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Start
        <input
          type="date"
          {...register("start_date", { required: true })}
          disabled={disabled}
          className="rounded border px-2 py-1.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        End
        <input
          type="date"
          {...register("end_date", { required: true })}
          disabled={disabled}
          className="rounded border px-2 py-1.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Location
        <input
          {...register("location", { required: true })}
          disabled={disabled}
          placeholder="e.g. Pittsburgh, PA"
          className="rounded border px-2 py-1.5"
        />
      </label>
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="self-end rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Adding…" : "Add Tournament"}
      </button>
    </form>
  );
}
