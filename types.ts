
export type TranslationTargetRole = {
  code: string;
  title: string;
  topSkills: string[];
};

export interface TranslationResult {
  professional: string;
  casual: string;
  ats: string;
}

export interface GuidedRoleMatch {
  id: string;
  title: string;
  summary: string;
  focusArea: string;
}

export interface GuidedTranslationResult {
  targetRoleTitle: string;
  translatedBullet: string;
  explanation: string;
}
