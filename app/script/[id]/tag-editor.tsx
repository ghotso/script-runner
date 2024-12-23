'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateTags } from '../../actions';
import { Script } from '@/types/script';
import { getTagColor } from '@/utils/tag-colors';

interface TagEditorProps {
  script: Script;
}

export default function TagEditor({ script }: TagEditorProps) {
  const [tags, setTags] = useState(script.tags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpdate = async () => {
    await updateTags(script.id, tags);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Tags:</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Badge key={tag} variant={getTagColor(tag) as any} className="px-2 py-1">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-xs font-bold"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex mt-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add new tag"
          className="mr-2"
        />
        <Button onClick={handleAddTag}>Add</Button>
      </div>
      <Button onClick={handleUpdate} className="mt-2">Update Tags</Button>
    </div>
  );
}

