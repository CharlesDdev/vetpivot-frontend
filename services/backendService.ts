import type { TranslationResult, TranslationTargetRole } from '../types';

// For local development, the backend is expected to run on port 8080.
// In a production environment, this should be configured to point to the deployed backend URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
type TranslationMode = 'bullet' | 'summary';

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
      const message = errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    const result: TranslationResult = await response.json();

    // Basic validation
    const isValid =
      typeof result.professional === 'string' &&
      typeof result.casual === 'string' &&
      typeof result.ats === 'string';
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
    professional: stripUntrustedNumericClaims(result.professional, allowedTokens),
    casual: stripUntrustedNumericClaims(result.casual, allowedTokens),
    ats: stripUntrustedNumericClaims(result.ats, allowedTokens),
  };
};
