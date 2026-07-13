import type { CareerAgentResult, TranslationResult, TranslationTargetRole } from '../types';

// Legacy translation endpoint. The main app flow uses the Career Agent API below.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Empty in production so Firebase Hosting rewrites same-origin /api/career-agent to Cloud Run.
export const CAREER_AGENT_API_BASE_URL = import.meta.env.VITE_CAREER_AGENT_API_URL || '';
type TranslationMode = 'bullet' | 'summary';

const normalizeCareerAgentError = (message: string, status?: number): string => {
  const lowerMessage = message.toLowerCase();

  if (
    status === 503 ||
    lowerMessage.includes('gemini live mode requires') ||
    lowerMessage.includes('google_api_key') ||
    lowerMessage.includes('gemini_api_key') ||
    lowerMessage.includes('live mode requires')
  ) {
    return 'Live AI is not configured on the server.';
  }

  if (
    status === 0 ||
    status === 502 ||
    status === 504 ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('networkerror') ||
    lowerMessage.includes('could not connect')
  ) {
    return 'The career agent is unavailable right now. Try again in a minute.';
  }

  return message || 'The career agent is unavailable right now. Try again in a minute.';
};

export const getTranslationFromBackend = async (
  text: string,
  targetRole?: TranslationTargetRole | null,
  translationMode?: TranslationMode
): Promise<TranslationResult> => {
  try {
    const payload: Record<string, unknown> = { text };
    if (translationMode) {
      payload.translation_mode = translationMode;
    }
    payload.realism_lock = {
      no_invented_metrics: true,
      no_invented_outcomes: true,
      use_only_user_provided_numbers: true,
    };

    if (targetRole?.code) {
      payload.target_role_code = targetRole.code;
    }

    if (targetRole?.title) {
      payload.target_role_title = targetRole.title;
    }

    if (targetRole?.topSkills?.length) {
      payload.target_role_skills = targetRole.topSkills;
    }

    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'An unknown error occurred on the server.' }));
      const message = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    const result: TranslationResult = await response.json();

    // Basic validation
    const isValid = typeof result.translation === 'string';
    if (!isValid) {
      throw new Error('Invalid data structure received from backend');
    }
    return sanitizeTranslationResult(result, text);
  } catch (error) {
    console.error('Error calling backend service:', error);
    if (error instanceof TypeError) {
      throw new Error('Could not connect to the backend service. Is it running?');
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while fetching the translation.');
  }
};

export const getCareerAgentFromBackend = async (
  militaryExperience: string,
  mosBranch: string,
  targetJobDescription: string
): Promise<CareerAgentResult> => {
  try {
    const response = await fetch(`${CAREER_AGENT_API_BASE_URL}/api/career-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        military_experience: militaryExperience,
        mos_branch: mosBranch,
        target_job_description: targetJobDescription,
        mode: 'auto',
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'An unknown error occurred on the Career Agent API.' }));
      const message = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(normalizeCareerAgentError(message, response.status));
    }

    const result: CareerAgentResult = await response.json();
    if (
      typeof result.professional_resume_bullet !== 'string' ||
      typeof result.ats_optimized_bullet !== 'string' ||
      typeof result.job_fit_assessment !== 'string' ||
      !Array.isArray(result.missing_keywords) ||
      !Array.isArray(result.interview_talking_points) ||
      !Array.isArray(result.safety_flags)
    ) {
      throw new Error('Invalid data structure received from Career Agent API');
    }
    return result;
  } catch (error) {
    console.error('Error calling Career Agent API:', error);
    if (error instanceof TypeError) {
      throw new Error('The career agent is unavailable right now. Try again in a minute.');
    }
    if (error instanceof Error) {
      throw new Error(normalizeCareerAgentError(error.message));
    }
    throw new Error('The career agent is unavailable right now. Try again in a minute.');
  }
};

const NUMERIC_TOKEN_REGEX = /\$?\d[\d,]*(?:\.\d+)?(?:%|[kKmMbB])?/g;

const normalizeNumericToken = (token: string): string => token.toLowerCase().replace(/,/g, '');

const getAllowedNumericTokens = (sourceText: string): Set<string> => {
  const matches = sourceText.match(NUMERIC_TOKEN_REGEX) ?? [];
  return new Set(matches.map(normalizeNumericToken));
};

const stripUntrustedNumericClaims = (value: string, allowedTokens: Set<string>): string => {
  return value
    .replace(NUMERIC_TOKEN_REGEX, (token) => (allowedTokens.has(normalizeNumericToken(token)) ? token : ''))
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
};

const sanitizeTranslationResult = (result: TranslationResult, sourceText: string): TranslationResult => {
  const allowedTokens = getAllowedNumericTokens(sourceText);
  return {
    translation: stripUntrustedNumericClaims(result.translation, allowedTokens),
  };
};
