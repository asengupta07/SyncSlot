import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { Availability } from "@/lib/models/Availability";
import { getUserId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "You must join a group first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { groupId, intervals } = body;

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

    const memberIds = group.members.map((m: { toString: () => string }) => m.toString());
    if (!memberIds.includes(userId)) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const parsedIntervals = Array.isArray(intervals)
      ? intervals
          .filter(
            (i: unknown) =>
              i &&
              typeof i === "object" &&
              "start" in i &&
              "end" in i &&
              typeof (i as { start: unknown }).start === "string" &&
              typeof (i as { end: unknown }).end === "string"
          )
          .map((i: { start: string; end: string }) => ({
            start: new Date(i.start),
            end: new Date(i.end),
          }))
          .filter((i: { start: Date; end: Date }) => !isNaN(i.start.getTime()) && !isNaN(i.end.getTime()) && i.start < i.end)
      : [];

    const groupStart = new Date(group.startDate);
    const groupEnd = new Date(group.endDate);

    const validIntervals = parsedIntervals
      .map((i: { start: Date; end: Date }) => ({
        start: i.start < groupStart ? groupStart : i.start,
        end: i.end > groupEnd ? groupEnd : i.end,
      }))
      .filter((i: { start: Date; end: Date }) => i.start < i.end);

    await Availability.findOneAndUpdate(
      { userId, groupId },
      { intervals: validIntervals },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability save error:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
