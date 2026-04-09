export const ACCEPTABLE_FORMATS = [
  "Standard",
  "Modern",
  "Pioneer",
  "Legacy",
  "Vintage",
  "Block",
  "Extended",
] as const;

export type Format = (typeof ACCEPTABLE_FORMATS)[number];
