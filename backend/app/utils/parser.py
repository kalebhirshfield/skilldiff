import io
from pypdf import PdfReader
from fastapi import UploadFile


async def extract_text_from_file(file: UploadFile) -> str:
    contents = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        pdf_reader = PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() + "\n"

        return extracted_text.strip()

    elif filename.endswith(".txt"):
        return contents.decode("utf-8", errors="ignore").strip()

    else:
        raise (ValueError("Unsupported file type. Upload a pdf or txt file."))
