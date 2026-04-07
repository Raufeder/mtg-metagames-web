interface Props {
  label: string;
  variant?: "blue" | "green" | "red" | "zinc";
}

const VARIANTS = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  zinc: "bg-zinc-100 text-zinc-700",
};

export function Badge({ label, variant = "blue" }: Props) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}
