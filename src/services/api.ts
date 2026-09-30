import { Startup } from '../types/startup';

const API_BASE_URL = 'https://api.example.com';

interface ApiResponse<T> {
  data: T;
}

interface CreateStartupResponse {
  id: string;
  name: string;
}

export const createStartup = async (startup: Startup): Promise<CreateStartupResponse> => {
  const response = await fetch(`${API_BASE_URL}/startups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(startup),
  });

  if (!response.ok) {
    throw new Error('Failed to create startup');
  }

  const data: ApiResponse<CreateStartupResponse> = await response.json();
  return data.data;
};
