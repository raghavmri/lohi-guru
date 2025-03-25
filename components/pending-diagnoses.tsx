"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Loader2, FileText } from "lucide-react"

export function PendingDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPendingDiagnoses = async () => {
      try {
        const response = await fetch("/api/pending-diagnoses")
        if (response.ok) {
          const data = await response.json()
          setDiagnoses(data)
        }
      } catch (error) {
        console.error("Error fetching pending diagnoses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingDiagnoses()
  }, [])

  const reviewDiagnosis = (diagnosisId: string) => {
    router.push(`/doctor/review/${diagnosisId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (diagnoses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>There are no pending diagnoses to review at the moment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">Check back later for new patient diagnoses to review.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Reviews</CardTitle>
        <CardDescription>Patient diagnoses waiting for your professional review.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnoses.map((diagnosis) => (
              <TableRow key={diagnosis._id?.toString()}>
                <TableCell className="font-medium">
                  {diagnosis.patient?.name || "Unknown"} ({diagnosis.patient?.age || "?"},{" "}
                  {diagnosis.patient?.gender || "?"})
                </TableCell>
                <TableCell className="max-w-xs truncate">{diagnosis.symptoms}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(diagnosis.createdAt), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="default" size="sm" onClick={() => reviewDiagnosis(diagnosis._id?.toString() || "")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

