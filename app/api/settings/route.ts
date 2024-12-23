import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Settings } from '@/types/settings';

const getSettingsFilePath = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.SETTINGS_PATH || '/data/settings.json'
    : path.join(process.cwd(), 'data', 'settings.json');
};

async function ensureSettingsFileExists() {
  const filePath = getSettingsFilePath();
  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify({ discordWebhook: '' }, null, 2));
  }
}

export async function GET() {
  await ensureSettingsFileExists();
  const filePath = getSettingsFilePath();
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const settings: Settings = JSON.parse(fileContents);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await ensureSettingsFileExists();
  const filePath = getSettingsFilePath();
  try {
    const newSettings: Settings = await request.json();
    await fs.writeFile(filePath, JSON.stringify(newSettings, null, 2));
    return NextResponse.json(newSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

