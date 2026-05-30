export type Profile = {
  id: string;
  full_name: string;
  education: string;
  interests: string[];
  projects: string[];
  certifications: string[];
  resume_text: string;
  github_url: string | null;
  linkedin_url: string | null;
  preferred_career_path: string;
};

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  level: number;
};

export type MarketTrend = {
  role: string;
  demandScore: number;
  topSkills: string[];
  source: string;
};

export type AiAnalysis = {
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  roadmap: string[];
  recommendations: string[];
  atsFeedback: string[];
};
