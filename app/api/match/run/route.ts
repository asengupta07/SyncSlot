import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { Availability } from "@/lib/models/Availability";
import { User } from "@/lib/models/User";
import { runMatchingEngine } from "@/lib/matching-engine";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { groupId, durationMinutes, minParticipants } = body;

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

    const availabilities = await Availability.find({ groupId });
    const users = await User.find({ _id: { $in: group.members } }).select(
      "name"
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    const userIdsWithAvailability = new Set<string>();
    const participantAvailabilities = availabilities
      .filter((a) => (a.intervals?.length ?? 0) > 0)
      .map((a) => {
        const uid = a.userId.toString();
        userIdsWithAvailability.add(uid);
        return {
          userId: uid,
          userName: userMap.get(uid) ?? "Unknown",
          intervals: a.intervals.map((i: { start: Date; end: Date }) => ({
            start: i.start.toISOString(),
            end: i.end.toISOString(),
          })),
        };
      });

    const membersWithoutAvailability = group.members
      .map((m: { toString: () => string }) => m.toString())
      .filter((uid: string) => !userIdsWithAvailability.has(uid))
      .map((uid: string) => ({
        userId: uid,
        userName: userMap.get(uid) ?? "Unknown",
      }));

    const result = runMatchingEngine(participantAvailabilities, {
      durationMinutes: durationMinutes ?? 30,
      minParticipants: minParticipants ?? 1,
    });

    return NextResponse.json({
      ...result,
      membersWithoutAvailability,
    });
  } catch (error) {
    console.error("Match run error:", error);
    return NextResponse.json(
      { error: "Failed to run matching" },
      { status: 500 }
    );
  }
}
