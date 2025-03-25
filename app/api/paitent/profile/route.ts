// app/api/patient/profile/route.js
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const patient = await db.collection("patients").findOne({ userId });

    return NextResponse.json({
      success: true,
      patient: patient || null,
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patient profile",
      },
      { status: 500 }
    );
  }
}
