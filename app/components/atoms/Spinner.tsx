interface Props {
  size?: "sm" | "md";
}

const SIZES = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
};

export function Spinner({ size = "sm" }: Props) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent opacity-80 ${SIZES[size]}`}
      aria-hidden="true"
    />
  );
}
