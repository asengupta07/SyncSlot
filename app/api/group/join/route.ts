import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Group } from "@/lib/models/Group";
import { getUserId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "You must log in to join a group" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user || !user.username) {
      return NextResponse.json(
        { error: "You must log in to join a group" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    const joinCode = (code || "").trim().toUpperCase();
    if (!joinCode) {
      return NextResponse.json(
        { error: "Join code is required" },
        { status: 400 }
      );
    }

    const group = await Group.findOne({ joinCode });
    if (!group) {
      return NextResponse.json(
        { error: "Invalid join code" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (group.endDate < now) {
      return NextResponse.json(
        { error: "This group has expired" },
        { status: 400 }
      );
    }

    const memberIds = group.members.map((m: { toString: () => string }) => m.toString());
    if (!memberIds.includes(user._id.toString())) {
      group.members.push(user._id);
      await group.save();
    }

    return NextResponse.json({
      groupId: group._id.toString(),
    });
  } catch (error) {
    console.error("Group join error:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}
