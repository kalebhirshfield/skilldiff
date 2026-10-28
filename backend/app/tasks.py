import asyncio
from app.celery_app import celery_app
from app.utils.prompt import generate_analysis


@celery_app.task(name="analyze_cv_task")
def analyze_cv_task(cv_text: str, description_text: str):
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(generate_analysis(cv_text, description_text))
    return result
