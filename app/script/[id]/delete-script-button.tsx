'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { deleteScript } from '@/app/actions';

interface DeleteScriptButtonProps {
  scriptId: string;
}

export default function DeleteScriptButton({ scriptId }: DeleteScriptButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this script?')) {
      setIsDeleting(true);
      await deleteScript(scriptId);
      router.push('/');
    }
  };

  return (
    <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deleting...' : 'Delete Script'}
    </Button>
  );
}

