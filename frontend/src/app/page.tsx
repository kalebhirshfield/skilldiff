"use client"

import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("Submit")

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
    </div>
  );
}
