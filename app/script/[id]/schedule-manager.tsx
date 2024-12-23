"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSchedule } from '../../actions';
import { Script } from '@/types/script';

interface ScheduleManagerProps {
  script: Script;
}

export default function ScheduleManager({ script }: ScheduleManagerProps) {
  const [schedule, setSchedule] = useState(script.schedule);

  const handleUpdate = async () => {
    await updateSchedule(script.id, schedule);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Schedule:</h3>
      <Input
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        placeholder="Enter cron expression (e.g., '0 * * * *' for hourly)"
        className="mt-2"
      />
      <Button onClick={handleUpdate} className="mt-2">Update Schedule</Button>
    </div>
  );
}

