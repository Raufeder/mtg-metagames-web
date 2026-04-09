import { notFound } from "next/navigation";
import { getMetagame } from "@/lib/api/metagames";
import { MetagameView } from "@/app/components/metagames/MetagameView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MetagamePage({ params }: Props) {
  const { id } = await params;

  let metagame;
  try {
    metagame = await getMetagame(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <MetagameView metagame={metagame} />
    </div>
  );
}
