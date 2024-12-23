'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

export default function SearchScripts({ scripts }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScripts = scripts.filter(script => 
    script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    script.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <Input
        type="text"
        placeholder="Search scripts by name or tag"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScripts.map((script) => (
          <Card key={script.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-700 px-4 py-5 border-b border-gray-200 dark:border-gray-600">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{script.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">Type: {script.type}</p>
              <div className="mt-2">
                {script.tags.map((tag) => (
                  <Badge key={tag} className="mr-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link href={`/script/${script.id}`} className="mt-2 inline-block text-blue-500 hover:underline">
                View Details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

