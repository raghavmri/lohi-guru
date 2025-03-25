"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { DiagnosisRequest } from "@/lib/models"
import { formatDistanceToNow } from "date-fns"
import { Eye, Loader2 } from "lucide-react"

export function DiagnosisHistory({ patientId }: { patientId: string }) {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const response = await fetch(`/api/diagnosis?patientId=${patientId}`)
        if (response.ok) {
          const data = await response.json()
          setDiagnoses(data)
        }
      } catch (error) {
        console.error("Error fetching diagnoses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiagnoses()
  }, [patientId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "ai-processed":
        return <Badge variant="secondary">AI Processed</Badge>
      case "doctor-reviewed":
        return <Badge variant="default">Doctor Reviewed</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const viewDiagnosis = (diagnosisId: string) => {
    router.push(`/patient/diagnosis/${diagnosisId}`)
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
          <CardTitle>Diagnosis History</CardTitle>
          <CardDescription>You haven't submitted any diagnosis requests yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">Submit a new diagnosis request to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnosis History</CardTitle>
        <CardDescription>View your previous diagnosis requests and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnoses.map((diagnosis) => (
              <TableRow key={diagnosis._id?.toString()}>
                <TableCell className="font-medium">
                  {formatDistanceToNow(new Date(diagnosis.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="max-w-xs truncate">{diagnosis.symptoms}</TableCell>
                <TableCell>{getStatusBadge(diagnosis.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => viewDiagnosis(diagnosis._id?.toString() || "")}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
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

