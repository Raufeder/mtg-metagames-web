import type { MetagameSet } from "@/lib/api/metagames";
import { Tooltip } from "@/app/components/atoms/Tooltip";
import Image from "next/image";

interface Props {
  set: MetagameSet;
  /** sm = list cards (no hover enlarge), lg = hero row (hover + enlarge) */
  size?: "sm" | "lg";
}

export function SetIcon({ set, size = "lg" }: Props) {
  if (!set.icon_set_image) return null;

  const img = (
    <Image
      src={set.icon_set_image}
      alt={set.name}
      width={96}
      height={96}
      className={
        size === "lg"
          ? "h-20 w-20 opacity-70 invert-0 dark:invert transition-all duration-150 hover:scale-110 hover:opacity-100 md:h-28 md:w-28"
          : "h-7 w-7 opacity-70 invert-0 dark:invert"
      }
      unoptimized
    />
  );

  if (size === "sm") return img;

  return (
    <Tooltip text={set.name}>
      <div className="flex flex-1 items-center justify-center">{img}</div>
    </Tooltip>
  );
}
