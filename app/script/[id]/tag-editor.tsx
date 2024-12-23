'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateTags } from '../../actions';
import { Script } from '@/types/script';
import { getTagColor } from '@/utils/tag-colors';
import { Tag, Plus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TagEditorProps {
  script: Script;
}

export default function TagEditor({ script }: TagEditorProps) {
  const [tags, setTags] = useState(script.tags);
  const [newTag, setNewTag] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
    await updateTags(script.id, tags);
    setIsUpdating(false);
    toast.success('Tags updated successfully');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Tags:</h3>
      <div className="flex flex-wrap gap-2 mb-2">
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
        <Button onClick={handleAddTag}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      <Button onClick={handleUpdate} className="mt-2" disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Tag className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Update Tags
          </>
        )}
      </Button>
    </div>
  );
}

