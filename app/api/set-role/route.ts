import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const client = await clerkClient();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    if (role !== "patient" && role !== "doctor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user metadata with role
    client.users.updateUserMetadata(userId, {
      privateMetadata: {
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
