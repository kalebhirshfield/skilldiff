import os
from groq import Groq
from pydantic import BaseModel
from typing import List
import json
from dotenv import load_dotenv

load_dotenv()


class ProjectRecommendation(BaseModel):
    title: str
    description: str
    difficulty: str


class GapAnalysisResponse(BaseModel):
    missing_skills: List[str]
    project_recommendations: List[ProjectRecommendation]


async def generate_analysis(cv_text: str, description_text: str) -> str:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    system_prompt = """
    You are an expert technical recruiter at a tech company.
    You are reviewing an applicant's CV and notice gaps in their experience.
    You are required to create a detailed description of an open source project that they should complete.
    They must be able to complete the project for free and the project must display the skills missing from their CV.
    
    You MUST respond ONLY with a raw JSON object. Do not include markdown formatting, backticks (```json), or any conversational text.

    The JSON object must strictly follow this schema:
    {
        "missing_skills": ["Skill 1", "Skill 2"],
        "project_recommendations": [
            {
                "title": "Project Name",
                "description": "Short description",
                "difficulty": "Beginner | Intermediate | Advanced"
            }
        ]
    }

    The applicant's CV and the description of the job that you are hiring for will be sent after this.
    """

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"CV: {cv_text}\n\nJob Descriiption: {description_text}",
            },
        ],
        model="openai/gpt-oss-120b",
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    raw_json_string = chat_completion.choices[0].message.content
    parsed_dict = json.loads(raw_json_string)
    validated_data = GapAnalysisResponse(**parsed_dict)
    return validated_data.model_dump()
