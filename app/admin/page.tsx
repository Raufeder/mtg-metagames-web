"use client";

import { useState } from "react";
import { MetagameSetupForm } from "./_components/MetagameSetupForm";
import { DeckEntryForm } from "./_components/DeckEntryForm";
import type { Metagame } from "@/lib/api/metagames";
import type { Tournament } from "@/lib/api/tournaments";

type Tab = "setup" | "decks";

export default function AdminPage() {
  const [metagame, setMetagame] = useState<Metagame | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tab, setTab] = useState<Tab>("setup");

  function addTournament(t: Tournament) {
    setTournaments((prev) => [...prev, t]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">MTG Metagame Admin</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        <TabButton
          active={tab === "setup"}
          onClick={() => setTab("setup")}
          label="Step 1 — Metagame Setup"
        />
        <TabButton
          active={tab === "decks"}
          onClick={() => setTab("decks")}
          disabled={!metagame}
          label="Step 2 — Deck Entry"
        />
      </div>

      {tab === "setup" ? (
        <MetagameSetupForm
          metagame={metagame}
          onMetagameCreated={setMetagame}
          tournaments={tournaments}
          onTournamentCreated={addTournament}
        />
      ) : metagame ? (
        <DeckEntryForm metagame={metagame} tournaments={tournaments} />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-t px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border border-b-white bg-white text-blue-700"
          : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}
