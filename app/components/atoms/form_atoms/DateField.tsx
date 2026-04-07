import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  registration: UseFormRegisterReturn;
  disabled?: boolean;
}

export function DateField({ label, registration, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="date"
        {...registration}
        disabled={disabled}
        className="rounded border px-2 py-1.5 disabled:opacity-50"
      />
    </label>
  );
}
