
export type TranslationTargetRole = {
  code: string;
  title: string;
  topSkills: string[];
};

export interface TranslationResult {
  translation: string;
}

export interface CareerAgentResult {
  professional_resume_bullet: string;
  ats_optimized_bullet: string;
  job_fit_assessment: string;
  matched_keywords: string[];
  missing_keywords: string[];
  interview_talking_points: string[];
  evaluation_notes: string;
  safety_flags: string[];
  unsupported_claims: string[];
  mode: string;
}
