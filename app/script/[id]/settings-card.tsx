'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Script } from '@/types/script';
import TagEditor from './tag-editor';
import ScheduleManager from './schedule-manager';
import { Clock, Tag } from 'lucide-react';

interface SettingsCardProps {
  script: Script;
}

export default function SettingsCard({ script }: SettingsCardProps) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg text-white">Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </h3>
          <TagEditor script={script} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </h3>
          <ScheduleManager script={script} />
        </div>
      </CardContent>
    </Card>
  );
}

