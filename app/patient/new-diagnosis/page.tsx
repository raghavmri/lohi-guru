"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DiagnosisForm } from "@/components/diagnosis-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewDiagnosisPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is loaded and redirect if not authenticated
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    // Fetch patient data if user is authenticated
    if (userId) {
      fetchPatientData();
    }
  }, [isLoaded, userId, router]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch("/api/patient-profile");
      const data = await response.json();

      if (!data) {
        // No patient profile found, redirect to create one
        router.push("/patient/profile");
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      router.push("/patient/dashboard");
    } finally {
      setLoading(false);
    }
  };
  console.log(loading, patient);
  // Show loading state while checking auth and fetching data
  if (loading || !patient) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            New Diagnosis Request
          </h2>
          <p className="text-muted-foreground">
            Submit your symptoms for AI analysis and doctor review.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Symptom Information</CardTitle>
            <CardDescription>
              Provide detailed information about your symptoms for the most
              accurate diagnosis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DiagnosisForm patientId={patient._id.toString()} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
