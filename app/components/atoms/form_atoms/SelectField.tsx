import { UseFormRegisterReturn } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  registration: UseFormRegisterReturn;
  options: readonly (Option | string)[];
  optional?: boolean;
  disabled?: boolean;
}

export function SelectField({ label, registration, options, optional, disabled }: Props) {
  const normalized: Option[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}{" "}
        {optional && <span className="text-text-muted">(optional)</span>}
      </span>
      <select
        {...registration}
        disabled={disabled}
        className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
      >
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
