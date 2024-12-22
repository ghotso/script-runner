import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SearchScripts from './components/search-scripts';

async function getScripts() {
  const filePath = path.join(process.cwd(), 'data', 'scripts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents).scripts;
}

export default async function Home() {
  const scripts = await getScripts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Script Runner</h1>
      <Link href="/add-script" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Add New Script
      </Link>
      <SearchScripts scripts={scripts} />
    </div>
  );
}

