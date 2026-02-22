import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { Availability } from "@/lib/models/Availability";
import { getUserId } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await connectDB();

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "You must join a group first" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const memberIds = group.members.map((m: { toString: () => string }) =>
      m.toString()
    );
    if (!memberIds.includes(userId)) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const availability = await Availability.findOne({ userId, groupId });
    const intervals = availability?.intervals?.map(
      (i: { start: Date; end: Date }) => ({
        start: i.start.toISOString(),
        end: i.end.toISOString(),
      })
    ) ?? [];

    return NextResponse.json({ intervals });
  } catch (error) {
    console.error("Availability me fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
