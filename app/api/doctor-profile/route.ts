import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Doctor } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorData = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // Check if doctor profile already exists
    const existingDoctor = await db.collection("doctors").findOne({ userId });

    if (existingDoctor) {
      // Update existing profile
      await db.collection("doctors").updateOne(
        { userId },
        {
          $set: {
            ...doctorData,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new profile
      const doctor: Doctor = {
        ...doctorData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("doctors").insertOne(doctor);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving doctor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const doctor = await db.collection("doctors").findOne({ userId });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
