import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";
import { GroupDashboard } from "@/components/GroupDashboard";

async function getGroup(id: string) {
  await connectDB();
  const group = await Group.findById(id);
  if (!group) return null;
  const members = await User.find({ _id: { $in: group.members } }).select(
    "name"
  );
  return {
    _id: group._id.toString(),
    name: group.name,
    description: group.description,
    creatorId: group.creatorId.toString(),
    joinCode: group.joinCode,
    startDate: group.startDate.toISOString(),
    endDate: group.endDate.toISOString(),
    members: members.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
    })),
    finalisedSlot:
      group.finalisedSlot?.start && group.finalisedSlot?.end
        ? {
            start: group.finalisedSlot.start.toISOString(),
            end: group.finalisedSlot.end.toISOString(),
          }
        : undefined,
    createdAt: group.createdAt.toISOString(),
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  return <GroupDashboard group={group} />;
}
