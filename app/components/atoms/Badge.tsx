interface Props {
  label: string;
  variant?: "blue" | "green" | "red" | "zinc";
}

const VARIANTS = {
  blue:    "bg-info/20 text-info",
  green:   "bg-success/20 text-success",
  red:     "bg-danger/20 text-danger",
  zinc:    "bg-bg-dark text-text-muted",
};

export function Badge({ label, variant = "blue" }: Props) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}
