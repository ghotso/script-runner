import { Script } from '@/types/script';

export async function getScripts(): Promise<Script[]> {
  const response = await fetch('/api/scripts');
  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }
  return response.json();
}

export async function getScript(id: string): Promise<Script | undefined> {
  const response = await fetch(`/api/scripts/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error('Failed to fetch script');
  }
  return response.json();
}

