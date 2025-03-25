import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { diagnosisId, diagnosis, notes, recommendations, approved, doctorName } = await request.json()

    if (!diagnosisId) {
      return NextResponse.json({ error: "Missing diagnosisId" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Update the diagnosis with doctor's review
    const result = await db.collection("diagnosisRequests").updateOne(
      { _id: new ObjectId(diagnosisId) },
      {
        $set: {
          doctorReview: {
            doctorId: userId,
            doctorName,
            diagnosis,
            notes,
            recommendations,
            approved,
            timestamp: new Date(),
          },
          status: "doctor-reviewed",
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting doctor review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

