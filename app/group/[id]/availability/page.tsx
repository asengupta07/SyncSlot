import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { PageHeader } from "@/components/PageHeader";

async function getGroup(id: string) {
  await connectDB();
  const group = await Group.findById(id);
  if (!group) return null;
  return {
    _id: group._id.toString(),
    name: group.name,
    startDate: group.startDate.toISOString(),
    endDate: group.endDate.toISOString(),
  };
}

export default async function AvailabilityPage({
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
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {group.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Click and drag to mark your free time. Drag on selected slots to
            remove.
          </p>
        </div>
        <AvailabilityCalendar
          groupId={id}
          startDate={group.startDate}
          endDate={group.endDate}
        />
      </main>
    </div>
  );
}
