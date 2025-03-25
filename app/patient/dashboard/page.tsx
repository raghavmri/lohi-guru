"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DiagnosisHistory } from "@/components/diagnosis-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, User, Settings } from "lucide-react";

export default function PatientDashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);

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
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {patient.name}
          </h2>
          <Button asChild>
            <Link href="/patient/new-diagnosis">New Diagnosis Request</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Diagnoses
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patient.diagnosisCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Diagnosis requests submitted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patient.profileComplete ? "Complete" : "Incomplete"}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/patient/profile"
                  className="text-primary hover:underline"
                >
                  {patient.profileComplete
                    ? "View profile"
                    : "Complete your profile"}
                </Link>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Account</div>
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/patient/settings"
                  className="text-primary hover:underline"
                >
                  Manage your account settings
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {patient._id && <DiagnosisHistory patientId={patient._id.toString()} />}
      </div>
    </DashboardLayout>
  );
}
