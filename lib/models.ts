export interface Patient {
  _id?: string
  userId: string
  name: string
  email: string
  dateOfBirth: string
  gender: string
  contactNumber: string
  address: string
  medicalHistory?: string
  createdAt: Date
  updatedAt: Date
}

export interface DiagnosisRequest {
  _id?: string
  patientId: string
  symptoms: string
  duration: string
  severity: string
  additionalNotes?: string
  files?: {
    name: string
    url: string
    type: string
  }[]
  aiDiagnosis?: {
    diagnosis: string
    confidence: number
    possibleConditions: string[]
    recommendations: string[]
    timestamp: Date
  }
  doctorReview?: {
    doctorId: string
    doctorName: string
    diagnosis: string
    notes: string
    recommendations: string[]
    approved: boolean
    timestamp: Date
  }
  status: "pending" | "ai-processed" | "doctor-reviewed" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  _id?: string
  userId: string
  name: string
  email: string
  specialization: string
  licenseNumber: string
  experience: number
  contactNumber: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

