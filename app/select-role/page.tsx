"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SelectRolePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const setRole = async (role: "patient" | "doctor") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Failed to set role")
      }

      toast({
        title: "Role set successfully",
        description: `You are now registered as a ${role}.`,
      })

      // Redirect based on role
      if (role === "doctor") {
        router.push("/doctor/dashboard")
      } else {
        router.push("/patient/dashboard")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
            <CardDescription>Register as a patient to submit symptoms and receive AI diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">As a patient, you can:</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Submit your symptoms and medical reports</li>
              <li>Receive AI-powered diagnosis</li>
              <li>Get verification from real doctors</li>
              <li>Track your diagnosis history</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setRole("patient")} disabled={isLoading}>
              Register as Patient
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doctor</CardTitle>
            <CardDescription>Register as a doctor to review and verify AI diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">As a doctor, you can:</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Review patient symptoms and reports</li>
              <li>Verify or modify AI-generated diagnoses</li>
              <li>Provide professional medical advice</li>
              <li>Manage multiple patient cases</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setRole("doctor")} disabled={isLoading}>
              Register as Doctor
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

