import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const doctor = await db.collection("doctors").findOne({ userId });

  if (!doctor) {
    return NextResponse.json({ redirect: "/doctor/profile" });
  }

  const pendingCount = await db
    .collection("diagnosisRequests")
    .countDocuments({ status: "ai-processed" });

  const reviewedCount = await db
    .collection("diagnosisRequests")
    .countDocuments({
      "doctorReview.doctorId": userId,
    });

  return NextResponse.json({
    doctor,
    pendingCount,
    reviewedCount,
  });
}
