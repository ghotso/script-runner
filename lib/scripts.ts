import { Script } from '@/types/script';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getScripts(): Promise<Script[]> {
  const response = await fetch(`${API_BASE_URL}/api/scripts`);
  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }
  return response.json();
}

export async function getScript(id: string): Promise<Script | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error('Failed to fetch script');
  }
  return response.json();
}

