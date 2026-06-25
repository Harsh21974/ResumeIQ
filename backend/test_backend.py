# test_backend.py
import os
import json
import time
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Import your functions - USING THE CORRECT ONES
from utils.pdf_extractor import extract_text_from_pdf
from utils.gemini_client import extract_resume_json_with_openrouter  # ← Fixed
from utils.job_parser import extract_job_json_with_openrouter  # ← Fixed
from utils.ats_score import calculate_ats_score
from utils.resume_improvements import generate_resume_improvements
from utils.role_suggestor import suggest_top_roles
from utils.current_level import detect_current_level
from utils.generate_roadmap import generate_roadmap_using_openrouter  # ← Fixed

def test_backend(pdf_path, job_title):
    """
    Test the complete backend pipeline with a static resume and job role
    """
    print("=" * 60)
    print("🚀 Testing ResumeIQ Backend Pipeline")
    print("=" * 60)
    
    total_start = time.time()
    
    try:
        # Step 1: Extract text from PDF
        print("\n📄 Step 1: Extracting text from PDF...")
        start = time.time()
        raw_text = extract_text_from_pdf(pdf_path)
        print(f"   ✅ Extracted {len(raw_text)} characters")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 2: Parse resume with OpenRouter
        print("\n🤖 Step 2: Parsing resume with OpenRouter API...")
        start = time.time()
        cleaned_text = extract_resume_json_with_openrouter(raw_text)  # ← Fixed
        print(f"   ✅ Resume parsed successfully")
        print(f"   📊 Found {len(cleaned_text.get('skills', {}).get('technical', []))} technical skills")
        print(f"   📊 Found {len(cleaned_text.get('experience', []))} experiences")
        print(f"   📊 Found {len(cleaned_text.get('projects', []))} projects")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 3: Parse job requirements
        print(f"\n💼 Step 3: Parsing job requirements for '{job_title}'...")
        start = time.time()
        job_json = extract_job_json_with_openrouter(job_title)  # ← Fixed
        print(f"   ✅ Job requirements parsed")
        print(f"   📊 Required skills: {len(job_json.get('required_skills', []))}")
        print(f"   📊 Optional skills: {len(job_json.get('optional_skills', []))}")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 4: Calculate ATS Score
        print("\n📊 Step 4: Calculating ATS Score...")
        start = time.time()
        ats_score = calculate_ats_score(cleaned_text, job_json)
        print(f"   ✅ ATS Score calculated")
        print(f"   🎯 Final Score: {ats_score.get('final_score', 0)}/100")
        if ats_score.get('final_score', 0) >= 60:
            print(f"   ✅ ATS Status: PASSED")
        else:
            print(f"   ❌ ATS Status: NOT PASSED")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 5: Generate Improvements
        print("\n💡 Step 5: Generating Improvements...")
        start = time.time()
        improvements = generate_resume_improvements(cleaned_text, job_json, ats_score)
        print(f"   ✅ Improvements generated")
        critical = len(improvements.get('critical_missing_skills', []))
        recommended = len(improvements.get('recommended_skill_additions', []))
        print(f"   📊 Critical missing skills: {critical}")
        print(f"   📊 Recommended additions: {recommended}")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 6: Suggest Roles
        print("\n🎯 Step 6: Suggesting Top Roles...")
        start = time.time()
        roles = suggest_top_roles(cleaned_text, ats_score)
        print(f"   ✅ Roles suggested")
        top_roles = roles.get('top_roles', [])
        for i, role in enumerate(top_roles[:3], 1):
            print(f"   {i}. {role.get('role')} (Confidence: {role.get('confidence')})")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 7: Detect Current Level
        print("\n📈 Step 7: Detecting Current Level...")
        start = time.time()
        level = detect_current_level(cleaned_text, ats_score)
        print(f"   ✅ Level detected: {level}")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 8: Generate Roadmap
        print("\n🗺️ Step 8: Generating Roadmap...")
        start = time.time()
        missing_skills = improvements.get('critical_missing_skills', [])
        skill_names = [s.get('skill') for s in missing_skills if isinstance(s, dict)]
        roadmap = generate_roadmap_using_openrouter(  # ← Fixed
            job_title, 
            ats_score.get('final_score', 0), 
            skill_names, 
            level
        )
        print(f"   ✅ Roadmap generated")
        print(f"   📊 Total duration: {roadmap.get('total_duration', 'N/A')}")
        weekly_plan = roadmap.get('weekly_plan', [])
        print(f"   📊 Weeks planned: {len(weekly_plan)}")
        print(f"   ⏱️  Time: {time.time() - start:.2f}s")
        
        # Step 9: Final Result
        total_time = time.time() - total_start
        print("\n" + "=" * 60)
        print("✅ TEST COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"\n📊 Summary:")
        print(f"   - ATS Score: {ats_score.get('final_score', 0)}/100")
        print(f"   - Status: {'✅ PASSED' if ats_score.get('final_score', 0) >= 60 else '❌ NOT PASSED'}")
        print(f"   - Current Level: {level}")
        print(f"   - Top Role: {top_roles[0].get('role') if top_roles else 'N/A'}")
        print(f"   - Total Time: {total_time:.2f}s")
        print(f"\n💾 Full result saved to: test_result.json")
        
        # Save full result
        result = {
            "ats_passed": ats_score.get('final_score', 0) >= 60,
            "final_score": ats_score.get('final_score', 0),
            "ats_score": ats_score,
            "improvements": improvements,
            "top_roles": top_roles,
            "current_level": level,
            "roadmap": roadmap
        }
        
        with open("test_result.json", "w") as f:
            json.dump(result, f, indent=2)
        
        return result
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Test with a sample resume PDF
    pdf_path = "Harsh_shahporia.pdf"  # Your resume file
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"❌ Error: PDF file not found at: {pdf_path}")
        print("\nPlease update the pdf_path variable with the correct path to your resume PDF.")
        print("Example: pdf_path = 'C:/Users/YourName/Downloads/MyResume.pdf'")
        exit()
    
    job_title = "Flutter Developer"  # Change this to any role you want to test
    
    print(f"📁 Testing with:")
    print(f"   - PDF: {pdf_path}")
    print(f"   - Job Role: {job_title}")
    print()
    
    result = test_backend(pdf_path, job_title)
    
    if result:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Tests failed. Check the error above.")