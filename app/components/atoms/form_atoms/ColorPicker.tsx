const VALID_COLORS = ["W", "U", "B", "R", "G", "C"] as const;
type Color = (typeof VALID_COLORS)[number];

const COLOR_LABELS: Record<Color, string> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
  C: "Colorless",
};

interface Props {
  value: string[];
  onChange: (colors: string[]) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  function toggle(color: Color) {
    if (value.includes(color)) {
      onChange(value.filter((c) => c !== color));
    } else {
      onChange([...value, color]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {VALID_COLORS.map((color) => {
        const active = value.includes(color);
        return (
          <button
            key={color}
            type="button"
            onClick={() => toggle(color)}
            title={COLOR_LABELS[color]}
            className={`rounded border px-3 py-1 text-sm font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-bg"
                : "border-border bg-bg-light text-text-muted hover:border-border-muted"
            }`}
          >
            {color}
          </button>
        );
      })}
    </div>
  );
}
