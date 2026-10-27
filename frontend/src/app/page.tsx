"use client"

import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProjectRecommendation {
  title: string;
  description: string;
  difficulty: string;
}

interface AnalysisResponse {
  missing_skills: string[];
  project_recommendations: ProjectRecommendation[];
}

export default function Home() {
  const [text, setText] = useState("Submit")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  async function sendData() {
    setText("Loading...")
    const cvInput = document.getElementById("CV")
    const descriptionInput = document.getElementById("Description")

    if (!(cvInput instanceof HTMLInputElement) || !cvInput.files?.[0]) {
      setText("Select a CV");
      return;
    }

    if (!(descriptionInput instanceof HTMLInputElement) || !descriptionInput.files?.[0]) {
      setText("Select a CV");
      return;
    }

    const cvFile = cvInput.files[0];
    const descriptionFile = descriptionInput.files[0]

    const formData = new FormData()
    formData.append("cv_file", cvFile)
    formData.append("description_file", descriptionFile)

    const response = await fetch("http://localhost:8000/analyse", { method: "POST", body: formData })
    const data = await response.json();

    setAnalysisResult(data);
    setText("Analysis Complete");
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
  );
}
