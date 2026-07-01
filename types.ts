
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
  workflow_mode?: 'targeted' | 'discovery';
  suggested_roles?: SuggestedCivilianRole[];
  selected_target_role?: string;
  career_discovery_notes?: string;
  onet_reference?: OnetReference;
}

export interface SuggestedCivilianRole {
  title: string;
  explanation: string;
  onet_code?: string;
  source?: string;
}

export interface OnetReference {
  used?: boolean;
  unavailable_reason?: string;
  occupations?: Array<{
    title: string;
    code?: string;
    source?: string;
  }>;
  tasks?: string[];
  skills?: string[];
  work_activities?: string[];
}
