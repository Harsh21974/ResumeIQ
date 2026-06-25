import os
import json
from typing import List, Dict

class OpenRouterError(Exception):
    pass


def generate_roadmap_using_openrouter(role, ats_score, missing_skills, current_level):
    """Generate a dynamic roadmap without AI - uses intelligent fallback"""
    return generate_fallback_roadmap(role, missing_skills, current_level)


def generate_fallback_roadmap(role, missing_skills, current_level):
    """Generate a comprehensive, dynamic roadmap based on the role"""
    
    # Detect the role category
    role_lower = role.lower()
    categories = {
        'tech': ['developer', 'engineer', 'programmer', 'coder', 'software', 'web', 'mobile', 'data', 'devops', 'cloud', 'security', 'it', 'systems', 'network', 'database', 'analyst', 'machine learning', 'ai', 'blockchain'],
        'design': ['designer', 'ui', 'ux', 'graphic', 'visual', 'creative', 'product design', 'interaction', 'art director'],
        'marketing': ['marketing', 'social media', 'seo', 'content', 'brand', 'digital marketing', 'growth', 'product marketing', 'brand manager'],
        'finance': ['finance', 'accounting', 'audit', 'banking', 'investment', 'financial', 'wealth', 'portfolio', 'treasury', 'credit'],
        'healthcare': ['nurse', 'doctor', 'healthcare', 'medical', 'clinical', 'pharma', 'dentist', 'therapist', 'radiologist', 'lab technician'],
        'education': ['teacher', 'educator', 'professor', 'trainer', 'instructor', 'academic', 'curriculum', 'principal', 'lecturer'],
        'legal': ['lawyer', 'attorney', 'legal', 'paralegal', 'compliance', 'advocate', 'solicitor', 'barrister'],
        'sales': ['sales', 'account executive', 'business development', 'b2b', 'b2c', 'account manager', 'sales rep', 'sales director'],
        'human_resources': ['hr', 'human resources', 'recruiter', 'talent acquisition', 'people ops', 'employee relations', 'benefits'],
        'project_management': ['project manager', 'program manager', 'scrum master', 'product owner', 'agile coach', 'delivery manager'],
        'customer_service': ['customer service', 'customer support', 'client services', 'help desk', 'technical support'],
        'operations': ['operations', 'supply chain', 'logistics', 'warehouse', 'inventory', 'procurement', 'facilities'],
        'consulting': ['consultant', 'advisory', 'adviser', 'consulting', 'strategy'],
        'research': ['researcher', 'scientist', 'r&d', 'research associate', 'clinical research'],
        'real_estate': ['realtor', 'real estate', 'property', 'mortgage', 'appraiser'],
        'hospitality': ['restaurant', 'hotel', 'hospitality', 'events', 'catering', 'travel', 'tourism']
    }
    
    # Find the category
    domain_type = "general"
    domain_name = "Professional"
    
    for category, keywords in categories.items():
        if any(keyword in role_lower for keyword in keywords):
            domain_type = category
            if category == 'tech': domain_name = "Technical"
            elif category == 'design': domain_name = "Design"
            elif category == 'marketing': domain_name = "Marketing"
            elif category == 'finance': domain_name = "Financial"
            elif category == 'healthcare': domain_name = "Healthcare"
            elif category == 'education': domain_name = "Education"
            elif category == 'legal': domain_name = "Legal"
            elif category == 'sales': domain_name = "Sales"
            elif category == 'human_resources': domain_name = "Human Resources"
            elif category == 'project_management': domain_name = "Project Management"
            elif category == 'customer_service': domain_name = "Customer Service"
            elif category == 'operations': domain_name = "Operations"
            elif category == 'consulting': domain_name = "Consulting"
            elif category == 'research': domain_name = "Research"
            elif category == 'real_estate': domain_name = "Real Estate"
            elif category == 'hospitality': domain_name = "Hospitality"
            break
    
    # Get role-specific content
    role_content = get_role_specific_content(domain_type, domain_name, role, missing_skills)
    
    # Generate weekly plan (8 weeks)
    weekly_plan = generate_weekly_plan(domain_type, domain_name, role, current_level)
    
    return {
        "total_duration": "8 Weeks",
        "roadmap_overview": f"A comprehensive 12-week plan to transition into a {role} role, focusing on building essential skills, gaining practical experience, and preparing for interviews.",
        "weekly_plan": weekly_plan,
        "certifications_or_trainings": role_content.get('certifications', []),
        "key_skills_to_develop": role_content.get('key_skills', []),
        "networking_strategy": role_content.get('networking', []),
        "portfolio_or_experience_building": role_content.get('portfolio', []),
        "interview_preparation": role_content.get('interview', {}),
        "resume_optimization": role_content.get('resume_tips', []),
        "common_mistakes_to_avoid": role_content.get('common_mistakes', []),
        "job_application_strategy": role_content.get('job_strategy', [])
    }


def get_role_specific_content(category, domain_name, role, missing_skills):
    """Get role-specific content based on the category"""
    
    content = {
        'certifications': [],
        'key_skills': [],
        'networking': [],
        'portfolio': [],
        'interview': {
            'domain_knowledge': [],
            'behavioral': [
                "Tell me about yourself and your career journey",
                "Why are you interested in this role and our company?",
                "Describe a challenging situation you handled successfully",
                "What are your greatest strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Tell me about a time you worked in a team to solve a problem",
                "How do you handle pressure and deadlines?"
            ]
        },
        'resume_tips': [
            "Highlight quantifiable achievements and results",
            "Use action verbs and be specific about your accomplishments",
            "Tailor your resume to each job application",
            "Include relevant keywords from the job description",
            "Keep formatting clean and professional"
        ],
        'common_mistakes': [
            "Not customizing applications for each role",
            "Overlooking soft skills and communication",
            "Neglecting to build practical experience",
            "Not networking with professionals in the field",
            "Underpreparing for interviews"
        ],
        'job_strategy': [
            f"Target {role} positions at companies of interest",
            "Apply to 5-10 relevant jobs per week",
            "Network and follow up on applications",
            "Prepare thoroughly for each interview"
        ]
    }
    
    # Customize based on category
    if category == 'tech':
        content['certifications'] = [
            "Relevant technical certifications (e.g., AWS, Azure, Google Cloud)",
            "Programming language certifications",
            "Agile/Scrum certifications",
            "Cybersecurity certifications (if relevant)"
        ]
        content['key_skills'] = [
            "Core programming/development skills",
            "Problem-solving and algorithmic thinking",
            "System design and architecture",
            "Version control (Git)",
            "Testing and debugging",
            "Database management",
            "API development and integration"
        ]
        content['networking'] = [
            "GitHub and open-source contributions",
            "Tech meetups and conferences",
            "Stack Overflow and developer communities",
            "LinkedIn networking",
            "Hackathons and coding challenges"
        ]
        content['portfolio'] = [
            "Build personal projects showcasing your skills",
            "Contribute to open-source projects",
            "Create a technical blog or documentation",
            "Develop a portfolio website",
            "Participate in coding competitions"
        ]
        content['interview']['domain_knowledge'] = [
            "Technical concepts and best practices",
            "System design and architecture",
            "Algorithms and data structures",
            "Industry trends and innovations"
        ]
        
    elif category == 'design':
        content['certifications'] = [
            "UX/UI design certifications",
            "Design thinking certifications",
            "Adobe Creative Suite certifications",
            "Figma/Adobe XD certifications"
        ]
        content['key_skills'] = [
            "User research and testing",
            "Prototyping and wireframing",
            "Visual design principles",
            "Design tools (Figma, Sketch, Adobe Creative Suite)",
            "Design systems and component libraries",
            "Accessibility and inclusive design"
        ]
        content['networking'] = [
            "Design communities (Dribbble, Behance)",
            "Design meetups and conferences",
            "LinkedIn networking",
            "UX/UI design groups"
        ]
        content['portfolio'] = [
            "Create case studies for your projects",
            "Build a portfolio website",
            "Showcase your design process",
            "Create mock projects",
            "Participate in design challenges"
        ]
        content['interview']['domain_knowledge'] = [
            "Design principles and best practices",
            "User psychology and behavior",
            "Product design process",
            "Current design trends"
        ]
        
    elif category == 'marketing':
        content['certifications'] = [
            "Google Analytics certification",
            "Google Ads certification",
            "HubSpot certifications",
            "SEO/SEM certifications"
        ]
        content['key_skills'] = [
            "Digital marketing strategies",
            "Content creation and copywriting",
            "SEO and SEM",
            "Social media management",
            "Analytics and data interpretation",
            "Email marketing",
            "Brand management"
        ]
        content['networking'] = [
            "Marketing conferences and events",
            "LinkedIn networking",
            "Professional marketing associations",
            "Digital marketing communities"
        ]
        content['portfolio'] = [
            "Create marketing campaigns",
            "Build a content portfolio",
            "Showcase successful strategies",
            "Create analytics reports",
            "Develop case studies"
        ]
        content['interview']['domain_knowledge'] = [
            "Marketing strategy and execution",
            "Digital marketing channels",
            "Analytics and ROI measurement",
            "Brand management principles"
        ]
        
    elif category == 'finance':
        content['certifications'] = [
            "CPA/CFA certifications",
            "Financial modeling certifications",
            "Excel certifications",
            "Risk management certifications"
        ]
        content['key_skills'] = [
            "Financial analysis and modeling",
            "Excel and data analysis",
            "Risk assessment and management",
            "Investment strategies",
            "Regulatory compliance",
            "Financial reporting",
            "Budgeting and forecasting"
        ]
        content['networking'] = [
            "Finance conferences and events",
            "Professional associations (CFA, CPA)",
            "LinkedIn networking",
            "Investment clubs"
        ]
        content['portfolio'] = [
            "Create financial models",
            "Develop investment analysis reports",
            "Build budgeting frameworks",
            "Create case studies"
        ]
        content['interview']['domain_knowledge'] = [
            "Finance concepts and principles",
            "Regulatory environment",
            "Industry trends",
            "Risk management practices"
        ]
        
    elif category == 'healthcare':
        content['certifications'] = [
            "Professional healthcare certifications",
            "CPR/First Aid certifications",
            "Specialized medical certifications",
            "Healthcare compliance certifications"
        ]
        content['key_skills'] = [
            "Patient care and communication",
            "Medical knowledge and best practices",
            "Healthcare documentation",
            "Safety and compliance",
            "Patient assessment",
            "Healthcare technology"
        ]
        content['networking'] = [
            "Medical associations and societies",
            "Healthcare conferences",
            "LinkedIn networking",
            "Professional healthcare groups"
        ]
        content['portfolio'] = [
            "Document patient care experiences",
            "Create case studies",
            "Develop healthcare project examples",
            "Build professional portfolio"
        ]
        content['interview']['domain_knowledge'] = [
            "Healthcare practices and protocols",
            "Patient care standards",
            "Healthcare regulations",
            "Medical ethics"
        ]
        
    elif category == 'education':
        content['certifications'] = [
            "Teaching certifications",
            "Specialized education courses",
            "Curriculum development certifications"
        ]
        content['key_skills'] = [
            "Teaching and instruction",
            "Curriculum design",
            "Student assessment",
            "Classroom management",
            "Communication and engagement",
            "Educational technology"
        ]
        content['networking'] = [
            "Educational associations",
            "Teaching conferences",
            "Professional development workshops",
            "Education communities"
        ]
        content['portfolio'] = [
            "Create lesson plans",
            "Develop curriculum examples",
            "Build teaching portfolios",
            "Document teaching experiences"
        ]
        content['interview']['domain_knowledge'] = [
            "Educational theory and practice",
            "Teaching methods",
            "Student engagement strategies",
            "Curriculum standards"
        ]
        
    elif category == 'sales':
        content['certifications'] = [
            "Sales certifications",
            "Negotiation courses",
            "CRM certifications",
            "Professional selling skills certifications"
        ]
        content['key_skills'] = [
            "Communication and persuasion",
            "Negotiation and closing",
            "CRM and sales tools",
            "Lead generation",
            "Account management",
            "Sales strategy",
            "Customer relationship building"
        ]
        content['networking'] = [
            "Sales conferences and events",
            "LinkedIn networking",
            "Professional sales associations",
            "Business networking groups"
        ]
        content['portfolio'] = [
            "Document sales achievements",
            "Create case studies",
            "Build client testimonials",
            "Develop sales presentations"
        ]
        content['interview']['domain_knowledge'] = [
            "Sales techniques and strategies",
            "Industry trends",
            "Product knowledge",
            "Customer psychology"
        ]
        
    elif category == 'human_resources':
        content['certifications'] = [
            "HR certifications (SHRM, PHR)",
            "Talent management courses",
            "Recruitment certifications"
        ]
        content['key_skills'] = [
            "Recruitment and talent acquisition",
            "Employee relations",
            "Benefits administration",
            "HRIS and HR technology",
            "Compliance and employment law",
            "Performance management",
            "Training and development"
        ]
        content['networking'] = [
            "HR associations (SHRM)",
            "HR conferences and events",
            "LinkedIn networking",
            "Professional HR communities"
        ]
        content['portfolio'] = [
            "Create HR case studies",
            "Develop policy documents",
            "Build recruitment strategies",
            "Create training materials"
        ]
        content['interview']['domain_knowledge'] = [
            "HR laws and compliance",
            "Talent management",
            "Employee engagement",
            "Organizational development"
        ]
        
    elif category == 'project_management':
        content['certifications'] = [
            "PMP/PMI certifications",
            "Agile/Scrum certifications",
            "Prince2 certification",
            "Lean Six Sigma certifications"
        ]
        content['key_skills'] = [
            "Project planning and execution",
            "Risk management",
            "Stakeholder communication",
            "Budgeting and resource management",
            "Agile methodologies",
            "Team leadership",
            "Project documentation"
        ]
        content['networking'] = [
            "PMI events and chapters",
            "Agile meetups",
            "LinkedIn networking",
            "Project management communities"
        ]
        content['portfolio'] = [
            "Create project plans",
            "Document project case studies",
            "Build project documentation",
            "Develop project templates"
        ]
        content['interview']['domain_knowledge'] = [
            "Project management methodologies",
            "Agile/Waterfall practices",
            "Resource management",
            "Risk assessment"
        ]
        
    else:
        # General/Professional
        content['certifications'] = [
            "Industry-relevant certifications",
            "Professional development courses",
            "Leadership training"
        ]
        content['key_skills'] = [
            "Core professional competencies",
            "Communication and collaboration",
            "Problem-solving and critical thinking",
            "Domain knowledge",
            "Project management",
            "Relationship building"
        ]
        content['networking'] = [
            "Professional associations",
            "Industry conferences and events",
            "LinkedIn networking",
            "Networking groups"
        ]
        content['portfolio'] = [
            "Create professional portfolio",
            "Document work experiences",
            "Build case studies",
            "Develop work samples"
        ]
        content['interview']['domain_knowledge'] = [
            "Industry knowledge",
            "Role-specific skills",
            "Professional standards",
            "Current trends"
        ]
    
    return content


def generate_weekly_plan(category, domain_name, role, current_level):
    """Generate a comprehensive weekly plan"""
    
    # Adjust based on current level
    is_entry = 'entry' in current_level.lower()
    is_mid = 'mid' in current_level.lower()
    is_senior = 'senior' in current_level.lower()
    
    # Customize week 2-3 based on level
    if is_entry:
        core_focus = f"Core {domain_name} Fundamentals"
        core_learning = [f"Learn essential {domain_name.lower()} concepts and principles", "Build foundational knowledge", "Understand industry standards"]
        core_practice = [f"Practice fundamental {domain_name.lower()} skills", "Apply basic concepts", "Develop core competencies"]
        core_deliverables = ["Learning portfolio", "Skill development plan", "Concept mastery checklist"]
    elif is_mid:
        core_focus = f"Advanced {domain_name} Skills"
        core_learning = ["Deepen expertise", "Master advanced concepts", "Learn best practices"]
        core_practice = ["Apply advanced skills", "Lead projects", "Implement solutions"]
        core_deliverables = ["Advanced project", "Skills demonstration", "Best practice documentation"]
    else:
        core_focus = f"Strategic {domain_name} Leadership"
        core_learning = ["Strategic thinking", "Leadership principles", "Innovation and best practices"]
        core_practice = ["Lead initiatives", "Mentor others", "Drive strategy"]
        core_deliverables = ["Strategic plan", "Leadership examples", "Innovation case studies"]
    
    weekly_plan = []
    
    # Week 1: Foundation
    weekly_plan.append({
        "week": 1,
        "focus": "Foundation & Assessment",
        "learning": [
            "Assess current skills and identify gaps",
            "Understand role requirements and expectations",
            "Set clear, achievable goals"
        ],
        "practice": [
            "Self-assessment exercises",
            "Goal setting with timeline",
            "Research industry standards"
        ],
        "deliverables": [
            "Skills assessment report",
            "Goal setting document",
            "Personal development plan"
        ]
    })
    
    # Week 2: Core Skills I
    weekly_plan.append({
        "week": 2,
        "focus": core_focus,
        "learning": core_learning,
        "practice": core_practice,
        "deliverables": core_deliverables
    })
    
    # Week 3: Core Skills II
    weekly_plan.append({
        "week": 3,
        "focus": f"Advanced {domain_name} Applications",
        "learning": [
            "Deep dive into advanced topics",
            "Master key tools and technologies",
            "Study real-world applications"
        ],
        "practice": [
            "Implement advanced techniques",
            "Work with professional tools",
            "Create comprehensive work samples"
        ],
        "deliverables": [
            "Advanced project demonstration",
            "Tool mastery examples",
            "Professional work samples"
        ]
    })
    
    # Week 4: Practical Experience
    weekly_plan.append({
        "week": 4,
        "focus": "Practical Experience Building",
        "learning": [
            "Apply learned skills to real scenarios",
            "Work on meaningful projects",
            "Solve practical problems"
        ],
        "practice": [
            "Create a project from scratch",
            "Solve case studies",
            "Build portfolio pieces"
        ],
        "deliverables": [
            "Project completion",
            "Case study solutions",
            "Portfolio work"
        ]
    })
    
    # Week 5: Networking
    weekly_plan.append({
        "week": 5,
        "focus": "Networking & Industry Engagement",
        "learning": [
            "Build professional network",
            "Engage with industry professionals",
            "Stay updated on trends"
        ],
        "practice": [
            "Connect with professionals",
            "Attend events and webinars",
            "Engage in professional communities"
        ],
        "deliverables": [
            "Network map",
            "Event participation",
            "Industry trend analysis"
        ]
    })
    
    # Week 6: Interview Prep
    weekly_plan.append({
        "week": 6,
        "focus": "Interview Preparation",
        "learning": [
            "Study common interview questions",
            "Practice effective responses",
            "Research target companies"
        ],
        "practice": [
            "Conduct mock interviews",
            "Record and review practice sessions",
            "Company research assignments"
        ],
        "deliverables": [
            "Interview preparation notes",
            "Practice recordings",
            "Company research documents"
        ]
    })
    
    # Week 7: Resume & Brand
    weekly_plan.append({
        "week": 7,
        "focus": "Resume & Personal Branding",
        "learning": [
            "Optimize resume and cover letter",
            "Build professional brand",
            "Create case studies"
        ],
        "practice": [
            "Revise resume and cover letter",
            "Update LinkedIn profile",
            "Create portfolio content"
        ],
        "deliverables": [
            "Updated resume",
            "Polished LinkedIn profile",
            "Portfolio documents"
        ]
    })
    
    # Week 8: Job Search & Launch
    weekly_plan.append({
        "week": 8,
        "focus": "Job Search & Career Launch",
        "learning": [
            "Implement job search strategy",
            "Network with recruiters",
            "Prepare for interviews"
        ],
        "practice": [
            "Submit job applications",
            "Follow up with recruiters",
            "Schedule interviews"
        ],
        "deliverables": [
            "Application submissions",
            "Interview schedules",
            "Job offer pipeline"
        ]
    })
    
    return weekly_plan