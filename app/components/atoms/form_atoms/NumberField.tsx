import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  registration: UseFormRegisterReturn;
  optional?: boolean;
  min?: number;
  disabled?: boolean;
}

export function NumberField({ label, registration, optional, min, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}{" "}
        {optional && <span className="text-zinc-400">(optional)</span>}
      </span>
      <input
        type="number"
        {...registration}
        min={min}
        disabled={disabled}
        className="w-20 rounded border px-2 py-1.5 disabled:opacity-50"
      />
    </label>
  );
}
