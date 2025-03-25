"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DiagnosisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is loaded and redirect if not authenticated
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    // Fetch diagnosis data if user is authenticated
    if (userId && params.id) {
      fetchDiagnosisData();
    }
  }, [isLoaded, userId, params.id, router]);

  const fetchDiagnosisData = async () => {
    try {
      const response = await fetch(`/api/diagnosis/${params.id}`);
      const data = await response.json();

      // if (!data.success || !data.diagnosis) {
      //   // No diagnosis found or not authorized, redirect to dashboard
      //   router.push("/patient/dashboard");
      //   return;
      // }

      setDiagnosis(data.diagnosis);
    } catch (error) {
      console.error("Error fetching diagnosis data:", error);
      // router.push("/patient/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "ai-processed":
        return <Badge variant="secondary">AI Processed</Badge>;
      case "doctor-reviewed":
        return <Badge variant="default">Doctor Reviewed</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show loading state while checking auth and fetching data
  if (loading || !diagnosis) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/patient/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              Diagnosis Details
            </h2>
          </div>
          <div>{getStatusBadge(diagnosis.status)}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Symptoms</CardTitle>
              <CardDescription>
                Submitted{" "}
                {formatDistanceToNow(new Date(diagnosis.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Symptoms</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnosis.symptoms}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Duration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnosis.duration}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Severity</h3>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {diagnosis.severity}
                </p>
              </div>
              {diagnosis.additionalNotes && (
                <div>
                  <h3 className="font-medium">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {diagnosis.additionalNotes}
                  </p>
                </div>
              )}
              {diagnosis.files && diagnosis.files.length > 0 && (
                <div>
                  <h3 className="font-medium">Uploaded Files</h3>
                  <ul className="mt-1 space-y-1">
                    {diagnosis.files.map((file: any, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Diagnosis</CardTitle>
              <CardDescription>
                Generated by AI based on your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {diagnosis.aiDiagnosis ? (
                <>
                  <div>
                    <h3 className="font-medium">Preliminary Diagnosis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {diagnosis.aiDiagnosis.diagnosis}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Confidence</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {diagnosis.aiDiagnosis.confidence}%
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Possible Conditions</h3>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                      {diagnosis.aiDiagnosis.possibleConditions.map(
                        (condition: string, index: number) => (
                          <li key={index}>{condition}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium">Recommendations</h3>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                      {diagnosis.aiDiagnosis.recommendations.map(
                        (recommendation: string, index: number) => (
                          <li key={index}>{recommendation}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-950/50">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Note: This is an AI-generated diagnosis and should be
                      verified by a medical professional.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI diagnosis is being processed...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {diagnosis.doctorReview && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor's Review</CardTitle>
              <CardDescription>
                Professional assessment by Dr.{" "}
                {diagnosis.doctorReview.doctorName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Diagnosis</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnosis.doctorReview.diagnosis}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnosis.doctorReview.notes}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Recommendations</h3>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {diagnosis.doctorReview.recommendations.map(
                    (recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    )
                  )}
                </ul>
              </div>
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950/50">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This review was provided by a medical professional on{" "}
                  {new Date(
                    diagnosis.doctorReview.timestamp
                  ).toLocaleDateString()}
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
