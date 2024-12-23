import { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { getScript } from '@/lib/scripts';
import ScriptDetailClient from './script-detail-client';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props
): Promise<Metadata> {
  const id = params.id
  const script = await getScript(id)

  return {
    title: script ? script.name : 'Script Not Found',
  }
}

export default async function ScriptDetail({ params }: Props) {
  const script = await getScript(params.id);

  if (!script) {
    notFound();
  }

  return <ScriptDetailClient script={script} />;
}

