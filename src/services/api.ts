import { Startup } from '../types/startup';

export async function createStartup(startup: Startup, apiUrl: string, config?: RequestInit): Promise<Startup> {
  const response = await fetch(`${apiUrl}/startups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(startup),
    ...config,
  });

  if (!response.ok) {
    throw new Error('Failed to create startup');
  }

  return response.json();
}