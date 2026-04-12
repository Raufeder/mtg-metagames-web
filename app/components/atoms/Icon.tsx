"use client";

import * as Feather from "react-feather";

type FeatherIconName = keyof typeof Feather;

interface Props {
  name: FeatherIconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className }: Props) {
  const IconComponent = Feather[name] as React.FC<{ size?: number; className?: string }>;
  return <IconComponent size={size} className={className} />;
}
