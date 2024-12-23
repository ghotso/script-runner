"use client"

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { updateSchedule } from '../../actions';
import { Script } from '@/types/script';
import { Clock, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";
import { getReadableCronExpression } from '@/utils/cronUtils';

interface ScheduleManagerProps {
  script: Script;
}

export default function ScheduleManager({ script }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<string[]>(script.schedule ? script.schedule.split(',').filter(Boolean) : []);
  const [newSchedule, setNewSchedule] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddSchedule = async () => {
    if (newSchedule && !schedules.includes(newSchedule)) {
      setIsUpdating(true);
      const newSchedules = [...schedules, newSchedule];
      setSchedules(newSchedules);
      setNewSchedule('');
      await updateSchedule(script.id, newSchedules.join(','));
      setIsUpdating(false);
      toast.success('Schedule added successfully');
    }
  };

  const handleRemoveSchedule = async (scheduleToRemove: string) => {
    setIsUpdating(true);
    const newSchedules = schedules.filter(schedule => schedule !== scheduleToRemove);
    setSchedules(newSchedules);
    await updateSchedule(script.id, newSchedules.join(','));
    setIsUpdating(false);
    toast.success('Schedule removed successfully');
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddSchedule();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {schedules.map((schedule) => (
          <Badge key={schedule} variant="secondary" className="px-2 py-1">
            <span title={schedule}>{getReadableCronExpression(schedule)}</span>
            <button
              onClick={() => handleRemoveSchedule(schedule)}
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
          value={newSchedule}
          onChange={(e) => setNewSchedule(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter cron expression (e.g., '0 * * * *' for hourly)"
          className="mr-2"
          disabled={isUpdating}
        />
        <button
          onClick={handleAddSchedule}
          disabled={isUpdating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

