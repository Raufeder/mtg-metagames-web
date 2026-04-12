import type { MetagameDetail } from "@/lib/api/metagames";
import { MetagameHero } from "./MetagameHero";
import { TournamentsList } from "./TournamentsList";
import { ArchetypesList } from "./ArchetypesList";

interface Props {
  metagame: MetagameDetail;
  /** Optional slot rendered between the hero and the main sections (e.g. history blurb on home page) */
  children?: React.ReactNode;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}

export function MetagameView({ metagame, children }: Props) {
  return (
    <div className="space-y-10">
      <MetagameHero metagame={metagame} />

      {children}

      <Section title="Tournaments">
        <TournamentsList tournaments={metagame.tournaments} metagameId={metagame.id} />
      </Section>

      <Section title="Archetypes">
        <ArchetypesList archetypes={metagame.archetypes} metagameId={metagame.id} />
      </Section>

      <Section title="Tournament Winning Decks">
        <p className="text-sm text-text-muted">Coming soon.</p>
      </Section>

      {(metagame.banlist.length > 0 || metagame.restrictedlist.length > 0) && (
        <Section title="Format Card Restrictions">
          {metagame.banlist.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase tracking-wider">Banned</h3>
              <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {metagame.banlist.map((card) => (
                  <li key={card.id} className="mb-1 text-sm text-text">{card.name}</li>
                ))}
              </ul>
            </div>
          )}
          {metagame.restrictedlist.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase tracking-wider">Restricted</h3>
              <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {metagame.restrictedlist.map((card) => (
                  <li key={card.id} className="mb-1 text-sm text-text">{card.name}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
