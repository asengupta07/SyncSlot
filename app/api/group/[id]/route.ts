import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const group = await Group.findById(id).populate("members", "name");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const members = await User.find({ _id: { $in: group.members } }).select(
      "name"
    );

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}
