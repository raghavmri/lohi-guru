"use client"; // Mark this as a client component

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PendingDiagnoses } from "@/components/pending-diagnoses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DoctorDashboardPage() {
  const { userId, isSignedIn } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [doctor, setDoctor] = useState<any>({});

  if (!userId || !isSignedIn) {
    redirect("/sign-in");
  }

  const load = async () => {
    const res = await fetch(`/api/doctor/dashboard?userId=${userId}`);
    const data = await res.json();

    if (data.redirect) {
      redirect(data.redirect);
    }

    setDoctor(data.doctor || {});
    setPendingCount(data.pendingCount || 0);
    setReviewedCount(data.reviewedCount || 0);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, Dr. {doctor.name}
          </h2>
          <p className="text-muted-foreground">
            Review and provide professional assessments for patient diagnoses.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Diagnoses waiting for your review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Reviews
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewedCount}</div>
              <p className="text-xs text-muted-foreground">
                Diagnoses you have reviewed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctor.specialization}</div>
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/doctor/profile"
                  className="text-primary hover:underline"
                >
                  View and edit your profile
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <PendingDiagnoses />
      </div>
    </DashboardLayout>
  );
}
