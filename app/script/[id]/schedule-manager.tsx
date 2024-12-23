"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSchedule } from '../../actions';
import { Script } from '@/types/script';
import { Clock, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScheduleManagerProps {
  script: Script;
}

export default function ScheduleManager({ script }: ScheduleManagerProps) {
  const [schedule, setSchedule] = useState(script.schedule);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateSchedule(script.id, schedule);
    setIsUpdating(false);
    toast.success('Schedule updated successfully');
  };

  return (
    <div>
      <Input
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        placeholder="Enter cron expression (e.g., '0 * * * *' for hourly)"
        className="mb-2"
      />
      <Button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Update Schedule
          </>
        )}
      </Button>
    </div>
  );
}

