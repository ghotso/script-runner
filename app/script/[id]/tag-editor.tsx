'use client'

import { useState } from 'react';
import { TagEditor as BaseTagEditor } from '@/components/tag-editor';
import { updateTags } from '../../actions';
import { type Script } from '@/types/script';

interface TagEditorProps {
  script: Script;
}

export default function TagEditor({ script }: TagEditorProps) {
  const [tags, setTags] = useState(script.tags);

  const handleTagsChange = async (newTags: string[]) => {
    setTags(newTags);
    await updateTags(script.id, newTags);
  };

  return (
    <BaseTagEditor tags={tags} onTagsChange={handleTagsChange} />
  );
}

