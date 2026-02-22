import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { addDays, startOfDay } from "date-fns";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Group } from "@/lib/models/Group";
import { getUserId } from "@/lib/session";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(ALPHABET, 8);

export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "You must log in to create a group" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user || !user.username) {
      return NextResponse.json(
        { error: "You must log in to create a group" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { groupName, description } = body;

    if (!groupName || typeof groupName !== "string" || groupName.trim().length === 0) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const startDate = startOfDay(now);
    const endDate = addDays(startDate, 14);

    let joinCode: string;
    let existing: typeof Group | null;
    do {
      joinCode = nanoid();
      existing = await Group.findOne({ joinCode });
    } while (existing);

    const group = await Group.create({
      name: groupName.trim(),
      description: description?.trim() || undefined,
      creatorId: user._id,
      joinCode,
      startDate,
      endDate,
      members: [user._id],
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "";
    const joinPath = `/join?code=${group.joinCode}`;
    return NextResponse.json({
      groupId: group._id.toString(),
      joinCode: group.joinCode,
      joinLink: origin ? `${origin}${joinPath}` : joinPath,
    });
  } catch (error) {
    console.error("Group create error:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
