import { API_BASE_URL } from './backendService';

export interface MilitaryCrosswalkSourceMatch {
  code: string;
  title: string;
}

export interface MilitaryCrosswalkOccupation {
  code: string;
  title: string;
  bright_outlook: boolean;
  source_matches: MilitaryCrosswalkSourceMatch[];
}

export interface MilitaryCrosswalkResponse {
  query: {
    keyword: string;
    branch: string;
    active: boolean;
    start: number;
    end: number;
  };
  total: number;
  occupations: MilitaryCrosswalkOccupation[];
}

export interface OccupationSkill {
  id: string;
  name: string;
  description: string;
  importance: number | null;
}

export interface OccupationSkillsResponse {
  code: string;
  total: number;
  skills: OccupationSkill[];
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `HTTP ${response.status}`;

  try {
    const payload = await response.json();
    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
      if (typeof payload.detail === 'string' && payload.detail.trim()) {
        return payload.detail;
      }
    }
  } catch {
    // Ignore JSON parsing errors and fall back to plain text.
  }

  try {
    const text = await response.text();
    if (text.trim()) {
      return text;
    }
  } catch {
    // Ignore read errors and return fallback.
  }

  return fallback;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Could not connect to the backend service. Is it running?');
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const searchMilitaryCrosswalk = async (
  keyword: string,
  branch = 'all',
  active = true
): Promise<MilitaryCrosswalkResponse> => {
  const safeKeyword = keyword.trim() || 'infantry';
  const params = new URLSearchParams({
    keyword: safeKeyword,
    branch,
    active: String(active),
  });
  const url = `${API_BASE_URL}/api/onet/military-crosswalk?${params.toString()}`;
  return fetchJson<MilitaryCrosswalkResponse>(url);
};

export const getOccupationSkills = async (
  code: string,
  sort = 'importance',
  start = 1,
  end = 10
): Promise<OccupationSkillsResponse> => {
  const params = new URLSearchParams({
    sort,
    start: String(start),
    end: String(end),
  });
  const safeCode = encodeURIComponent(code);
  const url = `${API_BASE_URL}/api/onet/occupations/${safeCode}/skills?${params.toString()}`;
  return fetchJson<OccupationSkillsResponse>(url);
};
