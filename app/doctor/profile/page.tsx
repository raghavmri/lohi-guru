"use client";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DoctorProfileForm } from "@/components/doctor-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DoctorProfilePage() {
  const { userId, isSignedIn } = useAuth();

  if (!userId || !isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground">
            Manage your professional information and credentials.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              This information will be visible to patients when you review their
              diagnoses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorProfileForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
