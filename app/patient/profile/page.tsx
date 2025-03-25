"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PatientProfileForm } from "@/components/patient-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PatientProfilePage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Check if auth is loaded and redirect if not authenticated
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Show loading state while checking auth
  if (!isLoaded || !userId || !user) {
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
          <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and medical history.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              This information will be used for your diagnosis requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientProfileForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
