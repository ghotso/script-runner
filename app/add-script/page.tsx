'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addScript } from '../actions';

export default function AddScript() {
  const [name, setName] = useState('');
  const [type, setType] = useState('python');
  const [content, setContent] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tags, setTags] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addScript({
      name,
      type,
      content,
      requirements: requirements.split('\n').filter(r => r.trim() !== ''),
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
    });
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Script</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="python">Python</option>
            <option value="bash">Bash</option>
          </select>
        </div>
        <div>
          <Label htmlFor="content">Script Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="requirements">Requirements (one per line)</Label>
          <Textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <Button type="submit">Add Script</Button>
      </form>
    </div>
  );
}

