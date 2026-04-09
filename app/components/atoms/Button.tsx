import { ButtonSpinner } from "./ButtonSpinner";

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
  primary: "bg-primary hover:opacity-80 text-bg",
  success: "bg-success hover:opacity-80 text-bg",
  danger:  "bg-danger hover:opacity-80 text-bg",
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
      {loading ?  <ButtonSpinner className="h-6 w-6" /> : children}
    </button>
  );
}
