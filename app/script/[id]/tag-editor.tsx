'use client'

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateTags } from '../../actions';
import { Script } from '@/types/script';
import { getTagColor } from '@/utils/tag-colors';
import { Plus, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TagEditorProps {
  script: Script;
}

export default function TagEditor({ script }: TagEditorProps) {
  const [tags, setTags] = useState(script.tags);
  const [newTag, setNewTag] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddTag = async () => {
    if (newTag && !tags.includes(newTag)) {
      setIsUpdating(true);
      const newTags = [...tags, newTag];
      setTags(newTags);
      setNewTag('');
      await updateTags(script.id, newTags);
      setIsUpdating(false);
      toast.success('Tag added successfully');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsUpdating(true);
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    await updateTags(script.id, newTags);
    setIsUpdating(false);
    toast.success('Tag removed successfully');
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddTag();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant={getTagColor(tag) as any} className="px-2 py-1">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-xs font-bold"
              disabled={isUpdating}
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
          onKeyPress={handleKeyPress}
          placeholder="Add new tag"
          className="mr-2"
          disabled={isUpdating}
        />
        <button
          onClick={handleAddTag}
          disabled={isUpdating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

