import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
}

export function TextField({ label, registration, placeholder, optional, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}{" "}
        {optional && <span className="text-zinc-400">(optional)</span>}
      </span>
      <input
        type="text"
        {...registration}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded border px-2 py-1.5 disabled:opacity-50"
      />
    </label>
  );
}
