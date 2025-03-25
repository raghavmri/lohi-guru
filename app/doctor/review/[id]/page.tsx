import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DoctorReviewForm } from "@/components/doctor-review-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function ReviewDiagnosisPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId, isSignedIn } = useAuth();

  if (!userId || !isSignedIn) {
    redirect("/sign-in");
  }

  // Check if user has a doctor profile
  const client = await clientPromise;
  const db = client.db();
  const doctor = await db.collection("doctors").findOne({ userId });

  if (!doctor) {
    redirect("/doctor/profile");
  }

  try {
    const diagnosis = await db.collection("diagnosisRequests").findOne({
      _id: new ObjectId(params.id),
      status: "ai-processed",
    });

    if (!diagnosis) {
      redirect("/doctor/dashboard");
    }

    // Get patient information
    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(diagnosis.patientId),
    });

    const patientInfo = patient
      ? {
          name: patient.name,
          gender: patient.gender,
          age: calculateAge(patient.dateOfBirth),
        }
      : null;

    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/doctor/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              Review Diagnosis
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Review and Provide Professional Assessment</CardTitle>
              <CardDescription>
                Review the AI diagnosis and provide your professional
                assessment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DoctorReviewForm
                diagnosisId={params.id}
                aiDiagnosis={diagnosis.aiDiagnosis}
                patientInfo={patientInfo}
                doctorName={doctor.name}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    redirect("/doctor/dashboard");
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
