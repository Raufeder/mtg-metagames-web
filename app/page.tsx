import { getMetagames, getMetagame } from "@/lib/api/metagames";
import { MetagameView } from "@/app/components/metagames/MetagameView";

// /** Picks a stable index for today using the date as a seed. */
// function dailyIndex(length: number): number {
//   const today = new Date();
//   const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
//   return seed % length;
// }

export default async function HomePage() {
  const metagames = await getMetagames();

  if (metagames.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-text-muted">
        No metagames available yet.
      </div>
    );
  }

  // TODO: restore daily pick once testing is complete
  // const pick = metagames[dailyIndex(metagames.length)];
  const pick = metagames.find((m) => m.name === "Scars of Mirrodin Standard") ?? metagames[0];
  const metagame = await getMetagame(pick.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-primary">
        Metagame of the Day
      </p>

      <MetagameView metagame={metagame}>
        <section className="rounded-lg border border-border bg-bg-light px-6 py-5">
          <h2 className="mb-2 text-base font-semibold text-text">About this Metagame</h2>
          <p className="text-sm leading-relaxed text-text-muted">
            Historical context for <strong className="text-text">{metagame.name}</strong> is coming soon.
            This section will cover the defining cards, key breakout moments, and how the metagame evolved across tournaments.
          </p>
        </section>
      </MetagameView>
    </div>
  );
}
