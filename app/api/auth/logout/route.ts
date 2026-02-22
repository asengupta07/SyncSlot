import { NextResponse } from "next/server";
import { clearUserId } from "@/lib/session";

export async function POST() {
  try {
    await clearUserId();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to log out" },
      { status: 500 }
    );
  }
}
