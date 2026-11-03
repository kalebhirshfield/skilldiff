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
    You are an expert technical recruiter and Principal Engineer at a tech company.
    You are reviewing an applicant's CV against a job description to identify gaps in their experience and design custom portfolio projects to fill those gaps.

    SKILL EVALUATION RULE:
    If they have similar experience, e.g. experience with CI/CD but with a different platform, then count this as a skill they already have. Only list genuinely missing skills.

    PROJECT CREATION RULES:
    Create a minimum of 2 suggested projects for the applicant to complete.
    1. FREE: They must be able to complete the project for free using local environments or free-tiers.
    2. CONCRETE USE CASES: Do NOT suggest generic, abstract architectures (Bad: "Build a Scalable FastAPI Microservice"). You MUST suggest a specific, tangible, real-world application (Good: "A Discord bot that tracks GitHub PRs", "A CLI tool for local weather caching").
    3. FUN TITLES: Give each project a catchy, techy, sci-fi, or hacker-style name in the `title` field (e.g., "Project Nebula", "CacheNova", "CyberFetch").
    4. TARGETED: The project must clearly force the applicant to use the exact skills missing from their CV.

    OUTPUT FORMAT:
    You MUST respond ONLY with a raw JSON object. Do not include markdown formatting, backticks (```json), or any conversational text before or after the JSON.

    The JSON object must strictly follow this schema:
    {
        "missing_skills": ["Array of genuinely missing skills only, excluding transferable ones"],
        "project_recommendations": [
            {
                "title": "A catchy, techy, sci-fi, or hacker-style project codename (e.g., 'Project Nebula', 'CacheNova')",
                "description": "State the concrete, real-world app they are building, followed by a detailed explanation of how building it uses the missing skills. Do NOT use generic enterprise jargon.",
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
