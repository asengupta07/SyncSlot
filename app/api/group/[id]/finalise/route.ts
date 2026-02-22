import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { getUserId } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the group creator can finalise a time" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { start, end } = body;

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end times are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return NextResponse.json(
        { error: "Invalid time range" },
        { status: 400 }
      );
    }

    group.finalisedSlot = { start: startDate, end: endDate };
    await group.save();

    return NextResponse.json({
      finalisedSlot: {
        start: group.finalisedSlot!.start.toISOString(),
        end: group.finalisedSlot!.end.toISOString(),
      },
    });
  } catch (error) {
    console.error("Finalise error:", error);
    return NextResponse.json(
      { error: "Failed to finalise slot" },
      { status: 500 }
    );
  }
}
