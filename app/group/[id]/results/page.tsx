import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { ResultsView } from "@/components/ResultsView";
import { PageHeader } from "@/components/PageHeader";

async function getGroup(id: string) {
  await connectDB();
  const group = await Group.findById(id);
  if (!group) return null;
  return {
    _id: group._id.toString(),
    name: group.name,
    creatorId: group.creatorId.toString(),
    startDate: group.startDate.toISOString(),
    endDate: group.endDate.toISOString(),
    finalisedSlot:
      group.finalisedSlot?.start && group.finalisedSlot?.end
        ? {
            start: group.finalisedSlot.start.toISOString(),
            end: group.finalisedSlot.end.toISOString(),
          }
        : undefined,
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PageHeader backHref={`/group/${id}`} backLabel="← Back to group" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <ResultsView group={group} />
      </main>
    </div>
  );
}
