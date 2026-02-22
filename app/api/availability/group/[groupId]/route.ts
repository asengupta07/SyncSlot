import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { Availability } from "@/lib/models/Availability";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    await connectDB();

    const { groupId } = await params;
    const group = await Group.findById(groupId);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const availabilities = await Availability.find({ groupId }).populate(
      "userId",
      "name"
    );

    const result = availabilities.map((a) => {
      const user = a.userId as { _id: { toString: () => string }; name: string };
      return {
        userId: user._id.toString(),
        userName: user.name ?? "Unknown",
        intervals: a.intervals.map((i: { start: Date; end: Date }) => ({
          start: i.start.toISOString(),
          end: i.end.toISOString(),
        })),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Availability fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
