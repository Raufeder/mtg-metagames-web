import { Spinner } from "./Spinner";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "danger";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const VARIANTS = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
  className,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className ?? ""}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
