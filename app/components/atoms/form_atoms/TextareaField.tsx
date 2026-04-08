import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  hint?: string;
  rows?: number;
  mono?: boolean;
  disabled?: boolean;
}

export function TextareaField({
  label,
  registration,
  placeholder,
  hint,
  rows = 5,
  mono,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
      <textarea
        {...registration}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded border px-2 py-1.5 disabled:opacity-50 ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
