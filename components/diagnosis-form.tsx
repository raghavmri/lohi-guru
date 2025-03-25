"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const diagnosisFormSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in detail." }),
  duration: z.string().min(1, { message: "Please specify how long you have had these symptoms." }),
  severity: z.enum(["mild", "moderate", "severe"], {
    required_error: "Please select the severity of your symptoms.",
  }),
  additionalNotes: z.string().optional(),
  files: z
    .array(z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB`))
    .optional(),
})

type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>

export function DiagnosisForm({ patientId }: { patientId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      symptoms: "",
      duration: "",
      severity: undefined,
      additionalNotes: "",
      files: [],
    },
  })

  async function onSubmit(data: DiagnosisFormValues) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("symptoms", data.symptoms)
      formData.append("duration", data.duration)
      formData.append("severity", data.severity)
      formData.append("patientId", patientId)

      if (data.additionalNotes) {
        formData.append("additionalNotes", data.additionalNotes)
      }

      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          formData.append("files", file)
        }
      }

      const response = await fetch("/api/diagnosis", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit diagnosis request")
      }

      const result = await response.json()
      setAiDiagnosis(result.aiDiagnosis)

      toast({
        title: "Diagnosis request submitted",
        description: "Your request has been processed by AI and sent to a doctor for review.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit diagnosis request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms</FormLabel>
                <FormControl>
                  <Textarea placeholder="Please describe your symptoms in detail" className="min-h-32" {...field} />
                </FormControl>
                <FormDescription>Be as specific as possible about what you are experiencing.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3 days, 2 weeks, etc." {...field} />
                  </FormControl>
                  <FormDescription>How long have you been experiencing these symptoms?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How severe are your symptoms?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information that might be relevant"
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Include any other relevant information about your condition.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Medical Reports (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 5MB)</p>
                      </div>
                      <Input
                        id="dropzone-file"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          onChange(files)
                        }}
                        {...rest}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormDescription>Upload any relevant medical reports or test results.</FormDescription>
                <FormMessage />
                {value && value.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Selected files:</p>
                    <ul className="mt-1 text-sm text-muted-foreground">
                      {Array.from(value).map((file, index) => (
                        <li key={index}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit for Diagnosis"
            )}
          </Button>
        </form>
      </Form>

      {aiDiagnosis && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">AI Diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  This is a preliminary diagnosis generated by AI. A doctor will review this shortly.
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Preliminary Diagnosis:</h4>
                  <p>{aiDiagnosis.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium">Confidence:</h4>
                  <p>{aiDiagnosis.confidence}%</p>
                </div>
                <div>
                  <h4 className="font-medium">Possible Conditions:</h4>
                  <ul className="list-disc pl-5">
                    {aiDiagnosis.possibleConditions.map((condition: string, index: number) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="list-disc pl-5">
                    {aiDiagnosis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-950/50">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Note: This is an AI-generated diagnosis and should be verified by a medical professional. A doctor
                  will review your case and provide their assessment soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

