/**
 * Format a date-only ISO string (YYYY-MM-DD) as MM/DD/YYYY.
 * Splits the string directly to avoid UTC→local timezone shifts.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${month}/${day}/${year}`;
}
