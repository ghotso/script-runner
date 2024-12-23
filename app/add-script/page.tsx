'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from 'lucide-react';
import { addScript } from '../actions';
import { TagEditor } from '@/components/tag-editor';
import dynamic from 'next/dynamic';
import { Script } from '@/types/script';

const CodeEditor = dynamic(() => import('@uiw/react-textarea-code-editor').then((mod) => mod.default), { ssr: false });

export default function AddScript() {
  const [name, setName] = useState('');
  const [type, setType] = useState<'python' | 'bash'>('python');
  const [content, setContent] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addScript({
      name,
      type,
      content,
      requirements: requirements.split('\n').filter(r => r.trim() !== ''),
      tags,
      schedule: ''
    });
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Add New Script</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-white/5 border-white/10 focus:border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-white">Type</Label>
              <Select
                id="type"
                value={type}
                onValueChange={(value) => setType(value as 'python' | 'bash')}
                className="bg-white/5 border-white/10"
              >
                <option value="python">Python</option>
                <option value="bash">Bash</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="requirements" className="text-white">Requirements (one per line)</Label>
              <div className="mt-1.5">
                <CodeEditor
                  value={requirements}
                  language="python"
                  placeholder="Enter your requirements here..."
                  onChange={(evn) => setRequirements(evn.target.value)}
                  padding={15}
                  style={{
                    fontSize: 12,
                    backgroundColor: "#2D2D2D",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                  }}
                  className="rounded-md"
                  data-color-mode="dark"
                  data-line-numbers="true"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="content" className="text-white">Script Content</Label>
              <div className="mt-1.5">
                <CodeEditor
                  value={content}
                  language={type}
                  placeholder="Enter your script content here..."
                  onChange={(evn) => setContent(evn.target.value)}
                  padding={15}
                  style={{
                    fontSize: 12,
                    backgroundColor: "#2D2D2D",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                  }}
                  className="rounded-md"
                  data-color-mode="dark"
                  data-line-numbers="true"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Tags</Label>
              <TagEditor tags={tags} onTagsChange={setTags} />
            </div>
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Add Script
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

