"use client";

import { useForm } from "react-hook-form";
import { useToast } from "@/lib/toast/context";
import { TextField } from "@/app/components/atoms/form_atoms/TextField";
import { DateField } from "@/app/components/atoms/form_atoms/DateField";
import { Button } from "@/app/components/atoms/Button";

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
      <TextField
        label="Name"
        registration={register("name", { required: true })}
        placeholder="e.g. SCG Open Pittsburgh"
        disabled={disabled}
      />
      <DateField
        label="Start"
        registration={register("start_date", { required: true })}
        disabled={disabled}
      />
      <DateField
        label="End"
        registration={register("end_date", { required: true })}
        disabled={disabled}
      />
      <TextField
        label="Location"
        registration={register("location", { required: true })}
        placeholder="e.g. Pittsburgh, PA"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled} loading={isSubmitting} className="self-end">
        Add Tournament
      </Button>
    </form>
  );
}
