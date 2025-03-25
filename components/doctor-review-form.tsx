"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const reviewFormSchema = z.object({
  diagnosis: z.string().min(10, { message: "Please provide a detailed diagnosis." }),
  notes: z.string().min(10, { message: "Please provide detailed notes for the patient." }),
  recommendations: z.string().min(10, { message: "Please provide recommendations for the patient." }),
  approved: z.boolean(),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

export function DoctorReviewForm({
  diagnosisId,
  aiDiagnosis,
  patientInfo,
  doctorName,
}: {
  diagnosisId: string
  aiDiagnosis: any
  patientInfo: any
  doctorName: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      diagnosis: aiDiagnosis?.diagnosis || "",
      notes: "",
      recommendations: aiDiagnosis?.recommendations?.join("\n") || "",
      approved: true,
    },
  })

  async function onSubmit(data: ReviewFormValues) {
    setIsLoading(true)
    try {
      // Convert recommendations from string to array
      const recommendationsArray = data.recommendations
        .split("\n")
        .filter((item) => item.trim() !== "")
        .map((item) => item.trim())

      const response = await fetch("/api/doctor-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagnosisId,
          diagnosis: data.diagnosis,
          notes: data.notes,
          recommendations: recommendationsArray,
          approved: data.approved,
          doctorName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })

      router.push("/doctor/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-sm font-medium">Name:</p>
                  <p className="text-sm text-muted-foreground">{patientInfo?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Age:</p>
                  <p className="text-sm text-muted-foreground">{patientInfo?.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Gender:</p>
                  <p className="text-sm text-muted-foreground">{patientInfo?.gender || "N/A"}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Diagnosis</h3>
              <div className="space-y-2 mt-2">
                <div>
                  <p className="text-sm font-medium">Preliminary Diagnosis:</p>
                  <p className="text-sm text-muted-foreground">{aiDiagnosis?.diagnosis || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Confidence:</p>
                  <p className="text-sm text-muted-foreground">{aiDiagnosis?.confidence || "N/A"}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Possible Conditions:</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {aiDiagnosis?.possibleConditions?.map((condition: string, index: number) => (
                      <li key={index}>{condition}</li>
                    )) || <li>N/A</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Diagnosis</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provide your professional diagnosis" className="min-h-32" {...field} />
                </FormControl>
                <FormDescription>You can modify the AI diagnosis or provide your own assessment.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for Patient</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provide detailed notes for the patient" className="min-h-24" {...field} />
                </FormControl>
                <FormDescription>Include any explanations or additional information for the patient.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommendations</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provide recommendations (one per line)" className="min-h-24" {...field} />
                </FormControl>
                <FormDescription>Enter each recommendation on a new line.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="approved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Approve AI Diagnosis</FormLabel>
                  <FormDescription>Toggle this if you generally agree with the AI diagnosis.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

