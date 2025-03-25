import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Patient } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientData = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // Check if patient profile already exists
    const existingPatient = await db.collection("patients").findOne({ userId });

    if (existingPatient) {
      // Update existing profile
      await db.collection("patients").updateOne(
        { userId },
        {
          $set: {
            ...patientData,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new profile
      const patient: Patient = {
        ...patientData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("patients").insertOne(patient);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving patient profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const patient = await db.collection("patients").findOne({ userId });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
