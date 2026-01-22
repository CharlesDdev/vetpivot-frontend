import { API_BASE_URL } from './backendService';

const ONET_SEARCH_ENDPOINT = '/api/onet/search';

export const searchOnet = async (keyword: string): Promise<any> => {
  const safeKeyword = keyword.trim() || 'infantry';
  const url = `${API_BASE_URL}${ONET_SEARCH_ENDPOINT}?keyword=${encodeURIComponent(safeKeyword)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorPayload = await response.text().catch(() => response.statusText);
      throw new Error(errorPayload || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch O*NET data.');
  }
};
