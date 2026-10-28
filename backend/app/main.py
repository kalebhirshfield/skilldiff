from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from app.utils.parser import extract_text_from_file
from app.tasks import analyse_cv_task
from app.celery_app import celery_app

app = FastAPI(title="SkillDiff")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://skilldiff.hirshfield.co.uk"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyse")
async def read_files(cv_file: UploadFile, description_file: UploadFile):
    cv_text = await extract_text_from_file(cv_file)
    description_text = await extract_text_from_file(description_file)

    task = analyse_cv_task.delay(cv_text, description_text)

    return {"task_id": task.id, "status": "PROCESSING"}


@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)

    if task_result.state == "PENDING":
        return {"status": "PROCESSING"}
    elif task_result.state == "SUCCESS":
        return {"status": "SUCCESS", "result": task_result.result}
    elif task_result.state == "FAILURE":
        return {"status": "FAILURE", "error": str(task_result.info)}

    return {"status": task_result.state}
