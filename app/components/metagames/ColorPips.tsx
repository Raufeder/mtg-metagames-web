const COLOR_CONFIG: Record<string, { bg: string; svg: string | null; label: string }> = {
  W: { bg: "#f2eace", svg: "/mtgColorSVGs/white.svg", label: "White" },
  U: { bg: "#c0d8f7", svg: "/mtgColorSVGs/blue.svg",  label: "Blue" },
  B: { bg: "#ada4ac", svg: "/mtgColorSVGs/black.svg", label: "Black" },
  R: { bg: "#d7a491", svg: "/mtgColorSVGs/red.svg",   label: "Red" },
  G: { bg: "#bdd2c2", svg: "/mtgColorSVGs/green.svg", label: "Green" },
  C: { bg: "#c8c8c8", svg: null,                       label: "Colorless" },
};

const SIZE: Record<"sm" | "md", { dim: string; text: string }> = {
  sm: { dim: "h-5 w-5",   text: "text-[9px]" },
  md: { dim: "h-7 w-7",   text: "text-[11px]" },
};

interface Props {
  colors: string[];
  size?: "sm" | "md";
}

export function ColorPips({ colors, size = "sm" }: Props) {
  if (colors?.length === 0) return null;
  const { dim, text } = SIZE[size];

  return (
    <div className="flex items-center gap-1">
      {colors?.map((c) => {
        const config = COLOR_CONFIG[c] ?? COLOR_CONFIG["C"];
        return (
          <span
            key={c}
            title={config.label}
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-black ${dim}`}
            style={{ backgroundColor: config.bg }}
          >
            {config.svg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.svg}
                alt={config.label}
                className={`h-full w-full object-cover ${config.label === "White" ? "scale-[1.25]" : config.label === "Red" ? "mt-1" : config.label === "Black" ? "mt-[3px]" : ""} `}
                aria-hidden
              />
            ) : (
              <span className={`font-bold leading-none text-black ${text}`}>C</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
