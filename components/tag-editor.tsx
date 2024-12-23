import React, { useState, KeyboardEvent } from 'react';
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, Plus } from 'lucide-react';

interface TagEditorProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

export function TagEditor({ tags, onTagsChange }: TagEditorProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-2 py-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 hover:text-destructive"
            >
              <X className="h-3 w-3" />
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
          className="bg-white/5 border-white/10 focus:border-white/20 mr-2"
        />
        <Button 
          type="button" 
          onClick={handleAddTag}
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

