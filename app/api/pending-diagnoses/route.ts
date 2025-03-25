import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all diagnoses that have been processed by AI but not yet reviewed by a doctor
    const pendingDiagnoses = await db
      .collection("diagnosisRequests")
      .find({ status: "ai-processed" })
      .sort({ createdAt: -1 })
      .toArray();

    // For each diagnosis, get the patient information
    const diagnosesWithPatientInfo = await Promise.all(
      pendingDiagnoses.map(async (diagnosis) => {
        const patient = await db
          .collection("patients")
          .findOne({ _id: diagnosis.patientId });
        return {
          ...diagnosis,
          patient: patient
            ? {
                name: patient.name,
                gender: patient.gender,
                age: calculateAge(patient.dateOfBirth),
              }
            : null,
        };
      })
    );

    return NextResponse.json(diagnosesWithPatientInfo);
  } catch (error) {
    console.error("Error fetching pending diagnoses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}
