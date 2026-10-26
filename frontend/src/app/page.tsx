import FileUpload from "@/components/file-upload";

export default function InputFile() {
  return (
    <div>
      {FileUpload("CV", "Select a pdf to upload.")}
      {FileUpload("Job Description", "Select a pdf to upload")}
    </div>
  );
}
