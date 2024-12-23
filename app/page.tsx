import { getScripts } from '@/lib/scripts'
import ScriptList from './components/script-list'

export default async function Home() {
  const initialScripts = await getScripts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Script Runner</h1>
      <ScriptList initialScripts={initialScripts} />
    </div>
  );
}

// Add this to ensure the page is dynamically rendered at runtime
export const dynamic = 'force-dynamic';

