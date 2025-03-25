import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateDiagnosis } from "@/lib/gemini";
import type { DiagnosisRequest } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const symptoms = formData.get("symptoms") as string;
    const duration = formData.get("duration") as string;
    const severity = formData.get("severity") as string;
    const additionalNotes = formData.get("additionalNotes") as string;
    const patientId = formData.get("patientId") as string;

    // Handle file uploads
    const files = formData.getAll("files") as File[];
    const fileData = [];

    // In a real app, you would upload these files to a storage service
    // For this example, we'll just store the file names
    for (const file of files) {
      fileData.push({
        name: file.name,
        type: file.type,
        url: `/uploads/${file.name}`, // This would be a real URL in production
      });
    }

    // Generate AI diagnosis
    const aiDiagnosis = await generateDiagnosis(
      symptoms,
      duration,
      severity,
      additionalNotes
    );

    // Create diagnosis request in MongoDB
    const client = await clientPromise;
    const db = client.db();

    const diagnosisRequest: DiagnosisRequest = {
      patientId,
      symptoms,
      duration,
      severity,
      additionalNotes,
      files: fileData,
      aiDiagnosis: {
        ...aiDiagnosis,
        timestamp: new Date(),
      },
      status: "ai-processed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("diagnosisRequests")
      .insertOne(diagnosisRequest);

    return NextResponse.json({
      success: true,
      diagnosisId: result.insertedId,
      aiDiagnosis,
    });
  } catch (error) {
    console.error("Error processing diagnosis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const diagnosisId = searchParams.get("diagnosisId");

    const client = await clientPromise;
    const db = client.db();

    if (diagnosisId) {
      // Get a specific diagnosis
      const diagnosis = await db
        .collection("diagnosisRequests")
        .findOne({ _id: diagnosisId });
      return NextResponse.json(diagnosis);
    } else if (patientId) {
      // Get all diagnoses for a patient
      const diagnoses = await db
        .collection("diagnosisRequests")
        .find({ patientId })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json(diagnoses);
    } else {
      return NextResponse.json(
        { error: "Missing patientId or diagnosisId" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
