"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getMetagame } from "@/lib/api/metagames";
import { useAdminStore } from "@/lib/store/adminStore";
import { AdminMetagameView } from "@/app/admin/_components/AdminMetagameView";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminMetagamePage({ params }: Props) {
  const { id } = use(params);
  const { setMetagame, metagame } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMetagame(id)
      .then(setMetagame)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, setMetagame]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PageSpinner className="h-16 w-16 text-text-muted" />
      </div>
    );
  }

  if (error || !metagame) {
    return <p className="p-10 text-center text-sm text-danger">{error ?? "Not found"}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <nav className="text-xs text-text-muted flex items-center gap-2">
        <Link href="/admin" className="hover:text-text transition-colors">Admin</Link>
        <span>/</span>
        <span className="text-text">{metagame.name}</span>
      </nav>

      <AdminMetagameView />
    </div>
  );
}
