// src/utils/helpers.ts
export const getRecurrenceText = (recurrence: any) => {
  console.log("Recurrence", recurrence.time)
  if (!recurrence) return 'No schedule';
  
  const time = recurrence.time 
    ? new Date(recurrence.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No time set';

  switch (recurrence.type) {
    case 'daily': return `Daily at ${time}`;
    case 'weekly':
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const selectedDays = recurrence.daysOfWeek?.map((day: number) => days[day]).join(', ');
      return `Weekly on ${selectedDays || 'no days'} at ${time}`;
    case 'custom': 
      return `Every ${recurrence.interval} ${recurrence.unit}(s) at ${time}`;
    default: return 'Custom schedule';
  }
};

export const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return 'No due date';
  return new Date(dueDate).toLocaleString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};