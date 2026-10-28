"use client"

import FileUpload from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface ProjectRecommendation {
  title: string
  description: string
  difficulty: string
}

interface AnalysisResponse {
  missing_skills: string[]
  project_recommendations: ProjectRecommendation[]
}

export default function Home() {
  const [text, setText] = useState("Submit")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)

  async function sendData() {
    setText("Uploading files...")
    setAnalysisResult(null)
    const cvInput = document.getElementById("CV")
    const descriptionInput = document.getElementById("Description")

    if (!(cvInput instanceof HTMLInputElement) || !cvInput.files?.[0]) {
      setText("Select a CV")
      return
    }

    if (!(descriptionInput instanceof HTMLInputElement) || !descriptionInput.files?.[0]) {
      setText("Select a CV")
      return
    }

    const cvFile = cvInput.files[0]
    const descriptionFile = descriptionInput.files[0]

    const formData = new FormData()
    formData.append("cv_file", cvFile)
    formData.append("description_file", descriptionFile)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const response = await fetch(`${API_URL}/analyse`, { method: "POST", body: formData })
    const { task_id } = await response.json()
    setText("Analysing...")

    const intervalId = setInterval(async () => {
      const statusRes = await fetch(`${API_URL}/tasks/${task_id}`)
      const statusData = await statusRes.json()

      if (statusData.status === "SUCCESS") {
        clearInterval(intervalId)
        setAnalysisResult(statusData.result)
        setText("Analysis Complete")
      } else if (statusData.status === "FAILURE") {
        clearInterval(intervalId)
        setText("Analysis Failed")
        console.error("Celery task error:", statusData.error)
      }
    }, 1500)
  }

  return (
    <div>
      <div className="pb-5">
        {FileUpload("CV", "Select a pdf to upload.")}
      </div>
      <div className="pb-5">
        {FileUpload("Description", "Select a pdf to upload")}
      </div>
      <Button variant="outline" onClick={sendData}>{text}</Button>
      {analysisResult && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identified Skill Gaps</CardTitle>
              <CardDescription>Skills found in the job description missing from your CV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missing_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Recommended Portfolio Projects</h2>
            {analysisResult.project_recommendations.map((project, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant="outline">{project.difficulty}</Badge>
                  </div>
                  <CardDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div >
  )
}
