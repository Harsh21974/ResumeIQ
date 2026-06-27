import os
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class JobParserError(Exception):
    pass

class JobDescriptionParser:
    """
    Universal Job Description Parser that works for ANY industry.
    Extracts structured information from job descriptions using AI + rules.
    """
    
    def __init__(self):
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise JobParserError("API key not found. Please set AI_API_KEY or OPENROUTER_API_KEY")
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        # Universal patterns for ALL industries
        self.patterns = {
            'experience': [
                r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work|professional)',
                r'experience\s*[:=]\s*(\d+)\+?\s*(?:years?|yrs?)',
                r'minimum\s*(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)',
                r'(\d+)-(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
                r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:in\s+)?(?:the\s+)?(?:industry|field)',
            ],
            'education': [
                r'(bachelor|master|phd|doctorate|mba|associate|high school|diploma|certificate)',
                r'(b\.?[as]|m\.?[as]|ph\.?d|mba|ba|bs|ma|ms|bcom|mcom|btech|mtech)',
                r'(?:degree|qualification|education)\s*[:=]\s*([a-zA-Z\s]+)',
                r'(?:graduate|post-graduate|undergraduate)',
            ],
            'salary': [
                r'\$?(\d{2,3}(?:,\d{3})*|\d{4,})(?:k|\s*[-–—]\s*\$?\d{2,3}(?:,\d{3})*|\d{4,})?',
                r'salary\s*[:=]\s*\$?(\d{2,3}(?:,\d{3})*|\d{4,})(?:k)?',
                r'(?:pay|compensation|package)\s*[:=]\s*\$?(\d{2,3}(?:,\d{3})*|\d{4,})',
            ],
            'location': [
                r'(?:location|city|remote|hybrid|onsite|office)\s*[:=]\s*([a-zA-Z\s,]+)',
                r'(remote|hybrid|onsite|in-office|work from home|wfh)',
                r'(?:based in|located in|position in)\s*([a-zA-Z\s,]+)',
            ],
            'employment_type': [
                r'(full-time|part-time|contract|freelance|internship|temporary|permanent|consultant)',
                r'(?:type|employment|work)\s*[:=]\s*(full-time|part-time|contract)',
            ],
            'seniority': [
                r'(senior|junior|mid-level|entry-level|lead|principal|staff|manager|director|vp|executive|associate|trainee|intern)',
                r'(?:level|seniority|experience level)\s*[:=]\s*([a-zA-Z\s-]+)',
            ],
            'industry': [
                r'(?:industry|sector|domain)\s*[:=]\s*([a-zA-Z\s]+)',
                r'(?:in the|within the)\s+([a-zA-Z\s]+)\s+(?:industry|sector)',
            ],
        }
        
        # Universal skill categories for ALL industries
        self.skill_categories = {
            # Technical/IT
            'programming': [
                'python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
                'swift', 'kotlin', 'dart', 'scala', 'perl', 'r', 'matlab', 'sql', 'nosql',
                'html', 'css', 'sass', 'less', 'typescript'
            ],
            'frameworks': [
                'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express',
                'node.js', 'next.js', 'rails', 'laravel', 'symfony', '.net', 'flutter'
            ],
            'cloud_devops': [
                'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
                'ci/cd', 'gitlab', 'github actions', 'ansible', 'prometheus', 'grafana'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'nlp', 'computer vision', 'ai',
                'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'tableau'
            ],
            
            # Business & Management
            'business': [
                'strategy', 'business development', 'market research', 'competitive analysis',
                'financial modeling', 'budgeting', 'forecasting', 'pricing strategy',
                'mergers and acquisitions', 'partnerships', 'negotiation', 'contract management'
            ],
            'management': [
                'leadership', 'team management', 'project management', 'agile', 'scrum',
                'people management', 'performance management', 'recruiting', 'mentoring',
                'strategic planning', 'resource allocation', 'stakeholder management'
            ],
            
            # Marketing & Communications
            'marketing': [
                'digital marketing', 'seo', 'sem', 'content marketing', 'social media',
                'email marketing', 'brand management', 'public relations', 'copywriting',
                'marketing analytics', 'google analytics', 'ads', 'campaign management'
            ],
            'communication': [
                'written communication', 'verbal communication', 'presentation skills',
                'public speaking', 'storytelling', 'technical writing', 'copywriting',
                'editing', 'proofreading', 'content creation'
            ],
            
            # Design & Creative
            'design': [
                'ui/ux design', 'graphic design', 'product design', 'interaction design',
                'user research', 'wireframing', 'prototyping', 'figma', 'adobe creative suite',
                'photoshop', 'illustrator', 'indesign', 'sketch', 'after effects'
            ],
            'creative': [
                'creative direction', 'art direction', 'brand identity', 'visual design',
                'typography', 'color theory', 'layout design', 'motion graphics'
            ],
            
            # Healthcare & Medical
            'healthcare': [
                'patient care', 'clinical', 'medical terminology', 'diagnosis', 'treatment planning',
                'patient assessment', 'medical records', 'healthcare administration',
                'nursing', 'pharmacology', 'radiology', 'laboratory', 'public health'
            ],
            'medical': [
                'registered nurse', 'physician', 'surgeon', 'dentist', 'pharmacist',
                'physical therapy', 'occupational therapy', 'speech therapy', 'psychology'
            ],
            
            # Education & Training
            'education': [
                'teaching', 'curriculum design', 'instructional design', 'lesson planning',
                'student assessment', 'classroom management', 'educational technology',
                'special education', 'adult education', 'e-learning', 'training'
            ],
            
            # Finance & Accounting
            'finance': [
                'accounting', 'auditing', 'tax', 'financial analysis', 'risk management',
                'investment', 'portfolio management', 'treasury', 'payroll', 'bookkeeping',
                'financial reporting', 'gaap', 'ifrs', 'compliance'
            ],
            
            # Legal
            'legal': [
                'legal research', 'contract law', 'corporate law', 'intellectual property',
                'compliance', 'litigation', 'mediation', 'arbitration', 'due diligence',
                'legal writing', 'case management', 'regulatory compliance'
            ],
            
            # Human Resources
            'hr': [
                'recruitment', 'talent acquisition', 'onboarding', 'employee relations',
                'compensation & benefits', 'performance management', 'training',
                'hr policies', 'labor laws', 'diversity & inclusion', 'workforce planning'
            ],
            
            # Operations & Logistics
            'operations': [
                'supply chain', 'logistics', 'inventory management', 'warehouse management',
                'procurement', 'vendor management', 'quality assurance', 'process improvement',
                'lean', 'six sigma', 'manufacturing', 'production planning'
            ],
            
            # Sales & Customer Service
            'sales': [
                'sales strategy', 'customer relationship management', 'lead generation',
                'closing', 'negotiation', 'account management', 'salesforce', 'cold calling',
                'sales forecasting', 'territory management', 'channel sales'
            ],
            'customer_service': [
                'customer support', 'client relations', 'issue resolution', 'active listening',
                'empathy', 'conflict resolution', 'help desk', 'customer satisfaction'
            ],
            
            # General/Universal
            'soft_skills': [
                'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
                'critical thinking', 'time management', 'adaptability', 'creativity',
                'emotional intelligence', 'conflict resolution', 'decision making',
                'delegation', 'initiative', 'dependability', 'organization', 'flexibility'
            ],
            'languages': [
                'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'arabic',
                'hindi', 'portuguese', 'russian', 'korean', 'italian', 'dutch', 'swedish'
            ],
            'tools': [
                'microsoft office', 'excel', 'word', 'powerpoint', 'outlook', 'teams',
                'google workspace', 'docs', 'sheets', 'slides', 'gmail', 'slack',
                'zoom', 'dropbox', 'onedrive', 'notion', 'asana', 'trello', 'jira'
            ]
        }
    
    def parse_job_description(self, job_title: str, job_description: str) -> Dict[str, Any]:
        """
        Main entry point: Parse job description using AI + rules
        Works for ANY industry/job type
        """
        print(f"\n📝 Parsing Job Description for: {job_title}")
        
        # Step 1: Detect industry/domain
        detected_industry = self._detect_industry(job_title, job_description)
        print(f"   🏢 Detected Industry: {detected_industry}")
        
        # Step 2: AI-based extraction
        ai_extracted = self._extract_with_ai(job_title, job_description)
        
        # Step 3: Rule-based extraction (fallback + enhancement)
        rule_extracted = self._extract_with_rules(job_description)
        
        # Step 4: Merge and enhance
        merged = self._merge_extractions(ai_extracted, rule_extracted)
        
        # Step 5: Add industry detection
        merged['detected_industry'] = detected_industry
        
        # Step 6: Additional analysis
        merged['keyword_frequency'] = self._analyze_keyword_frequency(job_description)
        merged['key_phrases'] = self._extract_key_phrases(job_description)
        merged['summary'] = self._generate_summary(merged)
        
        print(f"✅ Job description parsed successfully")
        print(f"   - Required skills: {len(merged.get('required_skills', []))}")
        print(f"   - Preferred skills: {len(merged.get('preferred_skills', []))}")
        print(f"   - Experience required: {merged.get('experience_required', 'Not specified')}")
        print(f"   - Industry: {detected_industry}")
        
        return merged
    
    def _detect_industry(self, title: str, description: str) -> str:
        """Detect industry/domain from job title and description"""
        text = f"{title} {description}".lower()
        
        industry_keywords = {
            'Technology / IT': [
                'software', 'developer', 'engineer', 'programmer', 'tech', 'it', 'information technology',
                'cloud', 'data', 'ai', 'machine learning', 'blockchain', 'cybersecurity', 'saas',
                'platform', 'digital', 'web', 'mobile', 'app', 'database', 'system'
            ],
            'Healthcare / Medical': [
                'healthcare', 'medical', 'clinical', 'nurse', 'doctor', 'physician', 'surgeon',
                'dentist', 'pharmacist', 'hospital', 'clinic', 'patient', 'treatment', 'diagnosis',
                'pharma', 'biotech', 'laboratory', 'radiology', 'mental health'
            ],
            'Finance / Banking': [
                'finance', 'banking', 'accounting', 'investment', 'audit', 'tax', 'wealth',
                'insurance', 'actuary', 'broker', 'trading', 'portfolio', 'treasury', 'compliance'
            ],
            'Education / Training': [
                'education', 'school', 'university', 'college', 'teacher', 'professor', 'instructor',
                'training', 'curriculum', 'student', 'academic', 'e-learning', 'tutor', 'mentor'
            ],
            'Marketing / Advertising': [
                'marketing', 'advertising', 'brand', 'social media', 'seo', 'content', 'digital marketing',
                'pr', 'public relations', 'campaign', 'analytics', 'communications', 'copywriter'
            ],
            'Sales / Business Development': [
                'sales', 'business development', 'account management', 'lead generation',
                'cold calling', 'closing', 'territory', 'negotiation', 'partner'
            ],
            'Human Resources': [
                'hr', 'human resources', 'recruitment', 'talent acquisition', 'people ops',
                'employee relations', 'compensation', 'benefits', 'training', 'workforce'
            ],
            'Legal': [
                'legal', 'law', 'attorney', 'lawyer', 'paralegal', 'compliance', 'contract',
                'litigation', 'intellectual property', 'corporate law', 'regulatory'
            ],
            'Operations / Logistics': [
                'operations', 'supply chain', 'logistics', 'warehouse', 'inventory', 'procurement',
                'manufacturing', 'quality', 'vendor', 'distribution', 'fleet'
            ],
            'Design / Creative': [
                'design', 'creative', 'art', 'graphic', 'ui', 'ux', 'visual', 'product design',
                'interaction design', 'illustrator', 'photoshop', 'figma', 'creative director'
            ],
            'Construction / Engineering': [
                'construction', 'civil', 'mechanical', 'electrical', 'structural', 'architecture',
                'building', 'infrastructure', 'project engineer', 'site engineer'
            ],
            'Hospitality / Tourism': [
                'hotel', 'restaurant', 'travel', 'tourism', 'hospitality', 'event planning',
                'catering', 'chef', 'front desk', 'concierge'
            ],
            'Retail / E-commerce': [
                'retail', 'ecommerce', 'e-commerce', 'store', 'merchandise', 'inventory',
                'customer service', 'cashier', 'sales associate', 'buyer'
            ],
            'Media / Entertainment': [
                'media', 'entertainment', 'journalism', 'broadcast', 'film', 'production',
                'music', 'events', 'content creator', 'youtube', 'podcast'
            ],
            'Government / Non-profit': [
                'government', 'public service', 'nonprofit', 'ngo', 'charity', 'public policy',
                'advocacy', 'community', 'social work', 'fundraising'
            ],
            'Consulting': [
                'consultant', 'consulting', 'advisory', 'management consulting', 'strategy',
                'analyst', 'transformation', 'change management'
            ],
            'Science / Research': [
                'research', 'science', 'scientist', 'laboratory', 'experiment', 'analysis',
                'chemistry', 'biology', 'physics', 'environmental', 'genetics'
            ],
            'Customer Service / Support': [
                'customer service', 'customer support', 'help desk', 'client services',
                'support specialist', 'call center', 'technical support'
            ]
        }
        
        # Count matches for each industry
        industry_scores = {}
        for industry, keywords in industry_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    score += text.count(keyword)
            if score > 0:
                industry_scores[industry] = score
        
        # Return industry with highest score, or fallback
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        return "General / Not Specified"
    
    def _extract_with_ai(self, job_title: str, job_description: str) -> Dict[str, Any]:
        """Use AI to extract structured information from job description"""
        prompt = f"""
You are an expert job description analyzer for ANY industry. Extract the following information:

Job Title: {job_title}

Job Description:
{job_description}

Extract and return ONLY valid JSON with this exact structure:

{{
    "required_skills": [],               // Must-have skills (list of strings) - ANY skills
    "preferred_skills": [],              // Nice-to-have skills (list of strings)
    "soft_skills": [],                   // Soft/interpersonal skills mentioned (list of strings)
    "experience_required": "X years",     // Experience requirement as string
    "education_required": "Degree type",  // Education requirement as string
    "seniority_level": "level",           // Entry/Mid/Senior/Lead/Principal/Manager
    "employment_type": "type",            // Full-time/Part-time/Contract/Internship
    "work_location": "location",          // Remote/Hybrid/Onsite + city
    "key_responsibilities": [],           // 5-10 key responsibilities (list of strings)
    "industry": "industry",               // Industry/domain (detected)
    "team_structure": "description",      // Team size/structure if mentioned
    "company_culture": "description",     // Culture and values if mentioned
    "benefits": [],                       // Benefits mentioned (list of strings)
    "tools_technologies": [],             // Tools/tech/equipment mentioned
    "certifications_required": [],        // Required certifications/licenses
    "certifications_preferred": []        // Preferred certifications/licenses
}}

Rules:
1. Return ONLY valid JSON, no markdown, no explanations
2. Use empty arrays [] for missing lists
3. Use "Not specified" for missing strings
4. Be specific and accurate - work for ALL industries
5. Include ALL skills mentioned, not just obvious ones
6. Categorize skills properly between required/preferred
7. Be inclusive of non-technical skills and requirements

JSON:
"""
        
        try:
            response = self.client.chat.completions.create(
                model="nvidia/nemotron-3-nano-30b-a3b:free",
                messages=[
                    {"role": "system", "content": "You are an expert job description analyzer. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            raw_text = response.choices[0].message.content.strip()
            raw_text = raw_text.strip("```").strip()
            result = json.loads(raw_text)
            
            # Ensure all required keys exist
            required_keys = ['required_skills', 'preferred_skills', 'soft_skills', 
                           'experience_required', 'education_required', 'seniority_level',
                           'employment_type', 'work_location', 'key_responsibilities',
                           'industry', 'team_structure', 'company_culture', 'benefits',
                           'tools_technologies', 'certifications_required', 'certifications_preferred']
            
            for key in required_keys:
                if key not in result:
                    result[key] = [] if 'skills' in key or 'responsibilities' in key or 'benefits' in key or 'tools' in key or 'certifications' in key else "Not specified"
            
            return result
            
        except Exception as e:
            print(f"⚠️ AI extraction failed: {e}")
            return self._get_default_extraction(job_title)
    
    def _get_default_extraction(self, job_title: str) -> Dict[str, Any]:
        """Fallback extraction when AI fails"""
        return {
            "required_skills": [],
            "preferred_skills": [],
            "soft_skills": [],
            "experience_required": "Not specified",
            "education_required": "Not specified",
            "seniority_level": "Not specified",
            "employment_type": "Not specified",
            "work_location": "Not specified",
            "key_responsibilities": [],
            "industry": "Not specified",
            "team_structure": "Not specified",
            "company_culture": "Not specified",
            "benefits": [],
            "tools_technologies": [],
            "certifications_required": [],
            "certifications_preferred": []
        }
    
    def _extract_with_rules(self, job_description: str) -> Dict[str, Any]:
        """Rule-based extraction to enhance AI results"""
        result = {
            'experience_required': self._extract_experience(job_description),
            'education_required': self._extract_education(job_description),
            'seniority_level': self._extract_seniority(job_description),
            'employment_type': self._extract_employment_type(job_description),
            'work_location': self._extract_location(job_description),
            'salary_range': self._extract_salary(job_description),
            'key_skills': self._extract_skills_with_rules(job_description),
        }
        return result
    
    def _extract_experience(self, text: str) -> str:
        """Extract experience requirements using regex - works for any industry"""
        for pattern in self.patterns['experience']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 2 and match.group(2):
                    return f"{match.group(1)}-{match.group(2)} years"
                return f"{match.group(1)} years"
        return "Not specified"
    
    def _extract_education(self, text: str) -> str:
        """Extract education requirements - works for any industry"""
        for pattern in self.patterns['education']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if isinstance(match.group(1), str):
                    return match.group(1).upper()
                return "Degree required"
        return "Not specified"
    
    def _extract_seniority(self, text: str) -> str:
        """Extract seniority level - works for any industry"""
        levels = ['entry-level', 'junior', 'mid-level', 'senior', 'lead', 'principal', 
                 'staff', 'manager', 'director', 'vp', 'executive', 'associate', 
                 'trainee', 'intern', 'specialist', 'expert']
        text_lower = text.lower()
        for level in levels:
            if level in text_lower:
                return level.title()
        return "Not specified"
    
    def _extract_employment_type(self, text: str) -> str:
        """Extract employment type - works for any industry"""
        types = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 
                'temporary', 'permanent', 'consultant']
        text_lower = text.lower()
        for emp_type in types:
            if emp_type in text_lower:
                return emp_type.title()
        return "Not specified"
    
    def _extract_location(self, text: str) -> str:
        """Extract work location - works for any industry"""
        text_lower = text.lower()
        if 'remote' in text_lower or 'work from home' in text_lower or 'wfh' in text_lower:
            return "Remote"
        elif 'hybrid' in text_lower:
            return "Hybrid"
        elif 'onsite' in text_lower or 'on-site' in text_lower or 'in-office' in text_lower:
            return "Onsite"
        
        # Try to extract city/location
        for pattern in self.patterns['location']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) > 0:
                    return match.group(1).strip()
                return match.group(0).strip()
        return "Not specified"
    
    def _extract_salary(self, text: str) -> Optional[str]:
        """Extract salary information - works for any industry"""
        for pattern in self.patterns['salary']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    def _extract_skills_with_rules(self, text: str) -> List[str]:
        """Extract skills using rule-based approach - works for ANY industry"""
        skills = set()
        text_lower = text.lower()
        
        # Check for skills in each category (works for all industries)
        for category, skill_list in self.skill_categories.items():
            for skill in skill_list:
                # Check for whole word or phrase
                if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                    skills.add(skill.title())
        
        return list(skills)
    
    def _merge_extractions(self, ai: Dict, rules: Dict) -> Dict:
        """Merge AI and rule-based extractions"""
        merged = ai.copy()
        
        # Use rule-based as fallback for missing fields
        if merged.get('experience_required') == "Not specified" and rules.get('experience_required'):
            merged['experience_required'] = rules['experience_required']
        
        if merged.get('education_required') == "Not specified" and rules.get('education_required'):
            merged['education_required'] = rules['education_required']
        
        if merged.get('seniority_level') == "Not specified" and rules.get('seniority_level'):
            merged['seniority_level'] = rules['seniority_level']
        
        if merged.get('employment_type') == "Not specified" and rules.get('employment_type'):
            merged['employment_type'] = rules['employment_type']
        
        if merged.get('work_location') == "Not specified" and rules.get('work_location'):
            merged['work_location'] = rules['work_location']
        
        # Add salary if available
        if rules.get('salary_range'):
            merged['salary_range'] = rules['salary_range']
        
        # Combine skills from rules with AI results
        if rules.get('key_skills'):
            existing_skills = set(merged.get('required_skills', []) + merged.get('preferred_skills', []))
            for skill in rules['key_skills']:
                if skill not in existing_skills:
                    merged['required_skills'].append(skill)
        
        return merged
    
    def _analyze_keyword_frequency(self, text: str) -> Dict[str, int]:
        """Analyze keyword frequency in job description"""
        text = text.lower()
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                    'of', 'with', 'by', 'as', 'is', 'was', 'were', 'be', 'been', 'being',
                    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
                    'could', 'can', 'may', 'might', 'very', 'just', 'also', 'than', 'that',
                    'this', 'these', 'those', 'from', 'into', 'through', 'during', 'about'}
        
        words = re.findall(r'\b[a-z]{3,}\b', text)
        filtered = [w for w in words if w not in stopwords]
        freq = Counter(filtered)
        return dict(freq.most_common(30))
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from job description"""
        phrases = re.findall(r'\b([a-z]+ [a-z]+ [a-z]+)\b', text.lower())
        phrases.extend(re.findall(r'\b([a-z]+ [a-z]+)\b', text.lower()))
        
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                    'of', 'with', 'by', 'as', 'is', 'was', 'were', 'be', 'been'}
        
        filtered = []
        for phrase in phrases:
            words = phrase.split()
            if len(words) >= 2 and all(w not in stopwords for w in words):
                filtered.append(phrase)
        
        freq = Counter(filtered)
        return [p for p, c in freq.most_common(20) if c > 1]
    
    def _generate_summary(self, data: Dict) -> str:
        """Generate a human-readable summary of the job requirements"""
        parts = []
        parts.append("📋 Job Requirements Summary:")
        parts.append("")
        
        if data.get('detected_industry'):
            parts.append(f"🏢 Industry: {data['detected_industry']}")
        
        if data.get('experience_required') and data['experience_required'] != "Not specified":
            parts.append(f"💼 Experience: {data['experience_required']}")
        
        if data.get('education_required') and data['education_required'] != "Not specified":
            parts.append(f"🎓 Education: {data['education_required']}")
        
        required = data.get('required_skills', [])[:5]
        if required:
            parts.append(f"🔑 Key Skills: {', '.join(required)}")
            if len(data.get('required_skills', [])) > 5:
                parts.append(f"   + {len(data['required_skills']) - 5} more skills")
        
        resp = data.get('key_responsibilities', [])[:3]
        if resp:
            parts.append(f"📋 Responsibilities: {', '.join(resp[:2])}")
            if len(resp) > 2:
                parts.append(f"   + {len(resp) - 2} more responsibilities")
        
        if data.get('work_location') and data['work_location'] != "Not specified":
            parts.append(f"📍 Location: {data['work_location']}")
        
        if data.get('employment_type') and data['employment_type'] != "Not specified":
            parts.append(f"📌 Type: {data['employment_type']}")
        
        return "\n".join(parts)
    
    def format_for_display(self, parsed: Dict) -> str:
        """Format parsed job description for display"""
        output = []
        output.append("=" * 70)
        output.append("📋 JOB DESCRIPTION ANALYSIS")
        output.append("=" * 70)
        
        output.append(f"\n🏢 Industry: {parsed.get('detected_industry', 'Not specified')}")
        
        output.append("\n📌 SUMMARY")
        output.append("-" * 40)
        output.append(parsed.get('summary', 'No summary available'))
        
        output.append(f"\n✅ REQUIRED SKILLS ({len(parsed.get('required_skills', []))})")
        output.append("-" * 40)
        for skill in parsed.get('required_skills', [])[:10]:
            output.append(f"  • {skill}")
        if len(parsed.get('required_skills', [])) > 10:
            output.append(f"  ... and {len(parsed['required_skills']) - 10} more")
        
        if parsed.get('preferred_skills'):
            output.append(f"\n💡 PREFERRED SKILLS ({len(parsed['preferred_skills'])})")
            output.append("-" * 40)
            for skill in parsed['preferred_skills'][:5]:
                output.append(f"  • {skill}")
            if len(parsed['preferred_skills']) > 5:
                output.append(f"  ... and {len(parsed['preferred_skills']) - 5} more")
        
        if parsed.get('soft_skills'):
            output.append(f"\n🤝 SOFT SKILLS ({len(parsed['soft_skills'])})")
            output.append("-" * 40)
            for skill in parsed['soft_skills'][:5]:
                output.append(f"  • {skill}")
        
        if parsed.get('key_responsibilities'):
            output.append(f"\n📋 KEY RESPONSIBILITIES ({len(parsed['key_responsibilities'])})")
            output.append("-" * 40)
            for resp in parsed['key_responsibilities'][:5]:
                output.append(f"  • {resp}")
            if len(parsed['key_responsibilities']) > 5:
                output.append(f"  ... and {len(parsed['key_responsibilities']) - 5} more")
        
        output.append("\n🎓 REQUIREMENTS")
        output.append("-" * 40)
        output.append(f"  Experience: {parsed.get('experience_required', 'Not specified')}")
        output.append(f"  Education: {parsed.get('education_required', 'Not specified')}")
        output.append(f"  Level: {parsed.get('seniority_level', 'Not specified')}")
        output.append(f"  Type: {parsed.get('employment_type', 'Not specified')}")
        output.append(f"  Location: {parsed.get('work_location', 'Not specified')}")
        
        if parsed.get('salary_range'):
            output.append(f"  Salary: {parsed['salary_range']}")
        
        if parsed.get('tools_technologies'):
            output.append(f"\n🛠️ TOOLS & TECHNOLOGIES")
            output.append("-" * 40)
            for tool in parsed['tools_technologies'][:5]:
                output.append(f"  • {tool}")
        
        if parsed.get('certifications_required'):
            output.append(f"\n📜 CERTIFICATIONS REQUIRED")
            output.append("-" * 40)
            for cert in parsed['certifications_required']:
                output.append(f"  • {cert}")
        
        if parsed.get('certifications_preferred'):
            output.append(f"\n📜 CERTIFICATIONS PREFERRED")
            output.append("-" * 40)
            for cert in parsed['certifications_preferred']:
                output.append(f"  • {cert}")
        
        if parsed.get('company_culture') and parsed['company_culture'] != "Not specified":
            output.append(f"\n🏛️ COMPANY CULTURE")
            output.append("-" * 40)
            output.append(f"  {parsed['company_culture']}")
        
        if parsed.get('benefits'):
            output.append(f"\n🎁 BENEFITS")
            output.append("-" * 40)
            for benefit in parsed['benefits'][:5]:
                output.append(f"  • {benefit}")
        
        output.append("\n" + "=" * 70)
        return "\n".join(output)


def test_job_parser():
    """Test the job description parser with sample job descriptions from various industries"""
    
    parser = JobDescriptionParser()
    
    # Test 1: Tech - Software Engineer
    job1 = {
        "title": "Senior Full Stack Developer",
        "description": """
        We are looking for a Senior Full Stack Developer to join our engineering team.
        Requirements:
        - 5+ years of experience in full stack development
        - Strong proficiency in React, Node.js, and TypeScript
        - Experience with cloud platforms (AWS, Azure, or GCP)
        - Knowledge of database systems (PostgreSQL, MongoDB)
        - Understanding of CI/CD pipelines and DevOps practices
        Nice to have: GraphQL, Kubernetes, Docker
        """
    }
    
    # Test 2: Healthcare - Nurse
    job2 = {
        "title": "Registered Nurse - ICU",
        "description": """
        We are seeking a compassionate Registered Nurse for our ICU department.
        Requirements:
        - Active RN license in the state
        - 2+ years of ICU or critical care experience
        - BLS and ACLS certification required
        - Strong patient assessment and communication skills
        - Ability to work 12-hour shifts
        Preferred: CCRN certification, BSN degree
        """
    }
    
    # Test 3: Education - Teacher
    job3 = {
        "title": "High School Math Teacher",
        "description": """
        We are looking for a passionate Math Teacher to join our high school.
        Requirements:
        - Bachelor's degree in Mathematics or Education
        - Valid teaching certification
        - 3+ years of teaching experience
        - Strong classroom management skills
        - Ability to teach Algebra, Geometry, and Calculus
        Preferred: Master's degree, Experience with online teaching
        """
    }
    
    # Test 4: Marketing - Digital Marketing Manager
    job4 = {
        "title": "Digital Marketing Manager",
        "description": """
        We are looking for a creative Digital Marketing Manager to lead our marketing team.
        Requirements:
        - 4+ years of digital marketing experience
        - Strong SEO, SEM, and social media expertise
        - Experience with Google Analytics and marketing automation tools
        - Excellent content creation and copywriting skills
        - Data-driven decision making abilities
        Preferred: HubSpot certification, Experience with B2B marketing
        """
    }
    
    # Test 5: Finance - Accountant
    job5 = {
        "title": "Senior Accountant",
        "description": """
        We are seeking a detail-oriented Senior Accountant to join our finance team.
        Requirements:
        - CPA certification required
        - 5+ years of accounting experience
        - Strong knowledge of GAAP and financial reporting
        - Experience with QuickBooks and Excel
        - Excellent analytical and problem-solving skills
        Preferred: MBA, Experience with public accounting
        """
    }
    
    # Test 6: Legal - Paralegal
    job6 = {
        "title": "Corporate Paralegal",
        "description": """
        We are seeking a detail-oriented Corporate Paralegal to support our legal team.
        Requirements:
        - Paralegal certification required
        - 3+ years of corporate law experience
        - Strong knowledge of contract law and legal research
        - Proficiency in legal documentation and filing
        - Excellent organizational skills
        Preferred: Experience with intellectual property, Notary public
        """
    }
    
    # Test 7: Design - UX/UI Designer
    job7 = {
        "title": "Senior UX/UI Designer",
        "description": """
        We are seeking a creative Senior UX/UI Designer to join our product team.
        Requirements:
        - 4+ years of UX/UI design experience
        - Strong portfolio of mobile and web design projects
        - Proficiency in Figma, Sketch, and Adobe Creative Suite
        - Experience with user research and usability testing
        - Knowledge of design systems and accessibility standards
        Preferred: Experience with prototyping, Knowledge of HTML/CSS
        """
    }
    
    # Test 8: HR - Human Resources Manager
    job8 = {
        "title": "Human Resources Manager",
        "description": """
        We are seeking an experienced Human Resources Manager to join our team.
        Requirements:
        - 5+ years of HR management experience
        - Strong knowledge of employment law and HR best practices
        - Experience with recruitment and talent management
        - Excellent conflict resolution skills
        - SHRM or PHR certification required
        Preferred: Experience with HRIS, MBA, Bilingual
        """
    }
    
    # Test 9: Non-Tech - Customer Service Manager
    job9 = {
        "title": "Customer Service Manager",
        "description": """
        We are looking for a Customer Service Manager to lead our support team.
        Requirements:
        - 3+ years of customer service management experience
        - Strong leadership and team motivation skills
        - Excellent communication and conflict resolution
        - Experience with CRM software
        - Track record of improving customer satisfaction
        Preferred: Bilingual, Experience in e-commerce
        """
    }
    
    # Test 10: General - Business Operations
    job10 = {
        "title": "Business Operations Analyst",
        "description": """
        We are looking for a detail-oriented Business Operations Analyst to join our team.
        Requirements:
        - 2+ years of experience in business operations or analysis
        - Strong analytical and problem-solving skills
        - Proficiency in Excel and data visualization tools
        - Experience with process improvement and project management
        - Excellent communication and presentation skills
        Preferred: MBA, Experience with Tableau, Six Sigma certification
        """
    }
    
    all_jobs = [
        ("TECH: Senior Full Stack Developer", job1),
        ("HEALTHCARE: Registered Nurse - ICU", job2),
        ("EDUCATION: High School Math Teacher", job3),
        ("MARKETING: Digital Marketing Manager", job4),
        ("FINANCE: Senior Accountant", job5),
        ("LEGAL: Corporate Paralegal", job6),
        ("DESIGN: Senior UX/UI Designer", job7),
        ("HR: Human Resources Manager", job8),
        ("SERVICE: Customer Service Manager", job9),
        ("OPERATIONS: Business Operations Analyst", job10),
    ]
    
    results = {}
    
    for label, job in all_jobs:
        print("\n" + "=" * 70)
        print(f"TEST: {label}")
        print("=" * 70)
        
        result = parser.parse_job_description(job["title"], job["description"])
        print(parser.format_for_display(result))
        results[label] = result
    
    # Save all results to JSON
    with open("job_parser_universal_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS COMPLETED!")
    print("=" * 70)
    print(f"\n📊 Tested {len(all_jobs)} different job types across various industries")
    print("📁 Results saved to: job_parser_universal_test_results.json")
    
    # Summary statistics
    print("\n📊 SUMMARY STATISTICS:")
    print("-" * 40)
    for label, result in results.items():
        industry = result.get('detected_industry', 'Unknown')
        required = len(result.get('required_skills', []))
        preferred = len(result.get('preferred_skills', []))
        print(f"  {label[:40]:<40} | Industry: {industry[:20]:<20} | Skills: {required} req, {pref} pref")


if __name__ == "__main__":
    test_job_parser()