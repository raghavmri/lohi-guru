"use client";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DoctorSettingsPage() {
  const { userId, isSignedIn } = useAuth();

  if (!userId || !isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="email-notifications"
                className="flex flex-col space-y-1"
              >
                <span>Email Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive email notifications when new diagnoses are ready for
                  review.
                </span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="browser-notifications"
                className="flex flex-col space-y-1"
              >
                <span>Browser Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive browser notifications when new diagnoses are ready for
                  review.
                </span>
              </Label>
              <Switch id="browser-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Manage your availability for reviewing diagnoses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="available-for-reviews"
                className="flex flex-col space-y-1"
              >
                <span>Available for Reviews</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Toggle this when you are available to review diagnoses.
                </span>
              </Label>
              <Switch id="available-for-reviews" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
