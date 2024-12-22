'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SearchScripts({ scripts }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScripts = scripts.filter(script => 
    script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    script.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Input
        type="text"
        placeholder="Search scripts by name or tag"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScripts.map((script) => (
          <Card key={script.id}>
            <CardHeader>
              <CardTitle>{script.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {script.type}</p>
              <div className="mt-2">
                {script.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="mr-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link href={`/script/${script.id}`} className="mt-2 text-blue-500 hover:underline">
                View Details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

