from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.utils.parser import extract_text_from_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyse")
async def read_files(cv_file: UploadFile, description_file: UploadFile) -> str:
    cv_text = await extract_text_from_file(cv_file)
    description_text = await extract_text_from_file(description_file)
    return "Success"
