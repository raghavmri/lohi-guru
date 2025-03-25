// app/api/diagnosis/[id]/route.js
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
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

    const diagnosis = await db.collection("diagnosisRequests").findOne({
      _id: new ObjectId(params.id),
    });

    if (!diagnosis) {
      return NextResponse.json(
        {
          success: false,
          error: "Diagnosis not found",
        },
        { status: 404 }
      );
    }

    // Check if this diagnosis belongs to the current user
    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(diagnosis.patientId),
      userId,
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch diagnosis",
      },
      { status: 500 }
    );
  }
}
