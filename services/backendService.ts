import type { TranslationResult } from '../types';

// For local development, the backend is expected to run on port 8080.
// In a production environment, this should be configured to point to the deployed backend URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const getTranslationFromBackend = async (text: string): Promise<TranslationResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
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
    return result;
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
