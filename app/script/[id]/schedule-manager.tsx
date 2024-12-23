"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSchedule } from '../../actions';
import { Script } from '@/types/script';
import { Clock, Check, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";

interface ScheduleManagerProps {
  script: Script;
}

export default function ScheduleManager({ script }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<string[]>(script.schedule ? [script.schedule] : []);
  const [newSchedule, setNewSchedule] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddSchedule = () => {
    if (newSchedule && !schedules.includes(newSchedule)) {
      setSchedules([...schedules, newSchedule]);
      setNewSchedule('');
    }
  };

  const handleRemoveSchedule = (scheduleToRemove: string) => {
    setSchedules(schedules.filter(schedule => schedule !== scheduleToRemove));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateSchedule(script.id, schedules.join(','));
    setIsUpdating(false);
    toast.success('Schedules updated successfully');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {schedules.map((schedule) => (
          <Badge key={schedule} variant="secondary" className="px-2 py-1">
            {schedule}
            <button
              onClick={() => handleRemoveSchedule(schedule)}
              className="ml-2 text-xs font-bold"
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
          placeholder="Enter cron expression (e.g., '0 * * * *' for hourly)"
          className="mr-2"
        />
        <Button onClick={handleAddSchedule}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      <Button onClick={handleUpdate} className="mt-2" disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Update Schedules
          </>
        )}
      </Button>
    </div>
  );
}

