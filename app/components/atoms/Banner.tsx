import { Icon } from "./Icon";
import type { ComponentProps } from "react";

type Variant = "success" | "warning" | "danger";

interface Props {
  variant: Variant;
  title: string;
  messages?: string[];
  className?: string;
}

const STYLES: Record<Variant, { container: string; icon: string; iconName: ComponentProps<typeof Icon>["name"] }> = {
  success: {
    container: "border-success/40 bg-success/10 text-success",
    icon: "text-success",
    iconName: "CheckCircle",
  },
  warning: {
    container: "border-warning/40 bg-warning/10 text-warning",
    icon: "text-warning",
    iconName: "AlertTriangle",
  },
  danger: {
    container: "border-danger/40 bg-danger/10 text-danger",
    icon: "text-danger",
    iconName: "AlertCircle",
  },
};

export function Banner({ variant, title, messages, className = "" }: Props) {
  const { container, icon, iconName } = STYLES[variant];
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 ${container} ${className}`}>
      <Icon name={iconName} size={16} className={`mt-0.5 shrink-0 ${icon}`} />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        {messages && messages.length > 0 && (
          <ul className="mt-1 space-y-0.5 opacity-80">
            {messages.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
