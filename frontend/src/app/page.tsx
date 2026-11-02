"use client"

import FileUpload from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef, useState } from "react"
import { Separator } from "@/components/ui/separator"

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
  const [text, setText] = useState("Analyse")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const warmupPromise = useRef<Promise<any> | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://skilldiff.onrender.com"

  useEffect(() => { warmupPromise.current = fetch(`${API_URL}/`).catch(() => console.log("Server waking up...")) }, [])

  async function sendData() {
    setIsLoading(true)

    const cvInput = document.getElementById("CV")
    const descriptionInput = document.getElementById("Description")

    if (!(cvInput instanceof HTMLInputElement) || !cvInput.files?.[0]) {
      setText("Select a CV")
      setIsLoading(false)
      return
    }

    if (!(descriptionInput instanceof HTMLInputElement) || !descriptionInput.files?.[0]) {
      setText("Select a Description")
      setIsLoading(false)
      return
    }

    if (warmupPromise.current) {
      setText("Waking up server...")
      await warmupPromise.current
      warmupPromise.current = null
    }

    setText("Uploading files...")
    setAnalysisResult(null)

    const cvFile = cvInput.files[0]
    const descriptionFile = descriptionInput.files[0]

    const formData = new FormData()
    formData.append("cv_file", cvFile)
    formData.append("description_file", descriptionFile)

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
        setIsLoading(false)
      } else if (statusData.status === "FAILURE") {
        clearInterval(intervalId)
        setText("Analysis Failed")
        console.error("Celery task error:", statusData.error)
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div>
      <div className="flex justify-center">
        <h1 className="text-xl font-bold p-5 tracking-tight">SKILLDIFF</h1>
      </div>
      <Separator />
      <div className="p-10 space-y-5">
        <Card>
          <CardContent className="space-y-5">
            <div>
              {FileUpload("CV", "Select a pdf/txt to upload.")}
            </div>
            <div>
              {FileUpload("Description", "Select a pdf/txt to upload")}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button className="w-full" variant="outline" onClick={sendData} disabled={isLoading}>{text}</Button>
        </div>
        {analysisResult && (
          <div className="space-y-5">
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
            <h2 className="text-xl font-semibold">Recommended Portfolio Projects</h2>
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
        )}
      </div>
    </div>
  )
}
