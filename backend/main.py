from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.pdf_extractor import extract_text_from_pdf, ScannedPDFError
from utils.gemini_client import extract_resume_json_with_openrouter
from utils.job_parser import extract_job_json_with_openrouter
from utils.ats_score import calculate_ats_score
from utils.resume_improvements import generate_resume_improvements
from utils.role_suggestor import suggest_top_roles
from utils.current_level import detect_current_level
from utils.generate_roadmap import generate_roadmap_using_openrouter
import os
import json
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="ResumeIQ API")

# CORS origins
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Save PDF temporarily
async def save_pdf(file: UploadFile) -> str:
    pdf_path = f"temp_{file.filename}"
    with open(pdf_path, "wb") as f:
        content = await file.read()
        f.write(content)
    return pdf_path

# Process the resume PDF
def process_resume(pdf_path: str, job_title: str) -> dict:
    try:
        raw_text = extract_text_from_pdf(pdf_path)
        cleaned_text = extract_resume_json_with_openrouter(raw_text)
        job_json = extract_job_json_with_openrouter(job_title)
        ats_score = calculate_ats_score(cleaned_text, job_json)
        improvements = generate_resume_improvements(
            cleaned_text, job_json, ats_score
        )
        roles = suggest_top_roles(cleaned_text, ats_score)
        level = detect_current_level(cleaned_text, ats_score)
        
        # Get missing skills for roadmap
        missing_skills = improvements.get('critical_missing_skills', [])
        skill_names = [s.get('skill') for s in missing_skills if isinstance(s, dict)]
        
        print(f"🔍 Generating roadmap for role: {job_title}")
        print(f"📊 ATS Score: {ats_score.get('final_score', 0)}")
        print(f"📝 Missing Skills: {skill_names}")
        print(f"📈 Current Level: {level}")
        
        # Generate roadmap (now uses only fallback)
        roadmap = generate_roadmap_using_openrouter(
            job_title, 
            ats_score.get('final_score', 0), 
            skill_names,
            level
        )
        
        # Log the roadmap response
        print(f"✅ Roadmap generated successfully:")
        print(f"   - Total Duration: {roadmap.get('total_duration', 'N/A')}")
        print(f"   - Weekly Plan Weeks: {len(roadmap.get('weekly_plan', []))}")
        print(f"   - Has Certifications: {bool(roadmap.get('certifications_or_trainings'))}")
        print(f"   - Has Interview Prep: {bool(roadmap.get('interview_preparation'))}")

        score = ats_score.get("final_score", 0)
        ats_passed = score >= 60

        return {
            "ats_passed": ats_passed,
            "final_score": score,
            "cleaned_resume": cleaned_text,
            "job_json": job_json,
            "ats_score": ats_score,
            "improvements": improvements,
            "top_roles": roles.get("top_roles", []),
            "current_level": level,
            "roadmap": roadmap
        }

    except ScannedPDFError as e:
        return {"error": f"Scanned PDF Error: {str(e)}"}
    except Exception as e:
        print(f"❌ Process Resume Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"Unexpected Error: {str(e)}"}
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@app.post("/api/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_title: str = Form(...)
):
    try:
        if not job_title.strip():
            return JSONResponse({"error": "Job title is required"}, status_code=400)

        pdf_path = await save_pdf(file)
        result = process_resume(pdf_path, job_title)
        
        # Print the full result for debugging
        print("\n" + "="*50)
        print("📋 FINAL RESULT:")
        print("="*50)
        print(f"ATS Passed: {result.get('ats_passed')}")
        print(f"Final Score: {result.get('final_score')}")
        print(f"Current Level: {result.get('current_level')}")
        print(f"Top Roles: {result.get('top_roles')}")
        
        # Check roadmap
        roadmap = result.get('roadmap', {})
        print(f"\n📌 Roadmap:")
        print(f"   - Duration: {roadmap.get('total_duration', 'N/A')}")
        print(f"   - Overview: {roadmap.get('roadmap_overview', 'N/A')[:50]}...")
        print(f"   - Weekly Plan Weeks: {len(roadmap.get('weekly_plan', []))}")
        
        if roadmap.get('weekly_plan'):
            print(f"   - First Week Focus: {roadmap['weekly_plan'][0].get('focus', 'N/A')}")
        print("="*50 + "\n")
        
        return JSONResponse(result)

    except Exception as e:
        print(f"❌ Upload Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)