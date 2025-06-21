// notificationService.ts
import * as Notifications from 'expo-notifications';
import { DayNumber, IHabit, IReminder, timeToSeconds, HabitRecurrenceType, IntervalUnit } from '@/db/types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Notification permissions not granted');
  }
  return status === 'granted';
};

// Cancel all notifications for a specific item
export const cancelNotificationsForItem = async (itemId: string) => {
  if (!itemId) {
    console.warn('Cannot cancel notifications - no itemId provided');
    return;
  }
  
  try {
    // First get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter notifications for this item and cancel them
    const notificationsToCancel = scheduledNotifications.filter(
      notification => notification.identifier.startsWith(itemId)
    );
    
    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

// Set multiple reminders for a habit/task
export const scheduleReminders = async (reminders: IReminder[], itemId: string) => {
  if (!itemId) {
    console.warn('Cannot schedule reminders - no itemId provided');
    return;
  }

  // First cancel any existing notifications for this item
  await cancelNotificationsForItem(itemId);

  // Schedule new notifications
  for (const reminder of reminders) {
    try {
      await setSingleReminder(reminder, itemId);
    } catch (error) {
      console.error(`Failed to schedule reminder: ${reminder.message}`, error);
    }
  }
};

// Helper function to schedule a single reminder
const setSingleReminder = async (reminder: IReminder, itemId: string) => {
  if (!reminder.timestamp) {
    console.warn('Reminder has no timestamp, skipping');
    return;
  }

  if (!itemId) {
    console.warn('Cannot schedule reminder - no itemId provided');
    return;
  }

  const date = new Date(reminder.timestamp);
  const notificationId = `${itemId}-${reminder.id}`; // Unique ID for each reminder

  const notificationContent = {
    title: reminder.title,
    body: reminder.message,
    data: { itemId, reminderId: reminder.id },
    sound: reminder.sound || 'default',
  };

  switch (reminder.type) {
    case 'date':
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: notificationContent,
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date,
        },
      });
      break;

    case 'interval':
      if (!reminder.interval || !reminder.unit) {
        console.warn('Interval reminder missing interval or unit');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: reminder.interval * timeToSeconds[reminder.unit],
          repeats: true,
        },
      });
      break;

    case 'daily':
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: date.getHours(),
          minute: date.getMinutes(),
        },
      });
      break;

    case 'weekly':
      if (!reminder.day) {
        console.warn('Weekly reminder missing day');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: DayNumber[reminder.day],
          hour: date.getHours(),
          minute: date.getMinutes(),
        },
      });
      break;

    default:
      console.warn(`Unknown reminder type: ${reminder.type}`);
  }
};

// Get all scheduled notifications (for debugging)
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// New function specifically for habit reminders
export const scheduleHabitReminders = async (habit: IHabit) => {
  if (!habit.id) {
    console.warn('Cannot schedule habit reminders - no habit id');
    return;
  }

  if (!habit.recurrence || !habit.recurrence.time) {
    console.warn('Habit missing recurrence or time');
    return;
  }

  // Cancel any existing notifications for this habit
  await cancelNotificationsForItem(habit.id);

  // Calculate reminder time (5 minutes before execution)
  const executionTime = new Date(habit.recurrence.time);
  const reminderTime = new Date(executionTime.getTime() - 5 * 60 * 1000); // 5 minutes before

  // Create notification content
  const notificationContent = {
    title: `Reminder: ${habit.title}`,
    body: `It's almost time for your habit!`,
    data: { habitId: habit.id, type: 'habit-reminder' },
    sound: 'default',
  };

  // Schedule based on recurrence type
  switch (habit.recurrence.type) {
    case 'daily':
      await Notifications.scheduleNotificationAsync({
        identifier: `${habit.id}-daily-reminder`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
        },
      });
      break;

    case 'weekly':
      if (!habit.recurrence.daysOfWeek || habit.recurrence.daysOfWeek.length === 0) {
        console.warn('Weekly habit missing daysOfWeek');
        return;
      }
      
      // Schedule for each selected day
      for (const dayIndex of habit.recurrence.daysOfWeek) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${habit.id}-weekly-reminder-${dayIndex}`,
          content: notificationContent,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: dayIndex + 1, // Expo uses 1-7 (Sunday=1)
            hour: reminderTime.getHours(),
            minute: reminderTime.getMinutes(),
          },
        });
      }
      break;

    case 'custom':
      if (!habit.recurrence.interval || !habit.recurrence.unit) {
        console.warn('Custom habit missing interval or unit');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        identifier: `${habit.id}-custom-reminder`,
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: habit.recurrence.interval * timeToSeconds[habit.recurrence.unit as IntervalUnit],
          repeats: true,
        },
      });
      break;

    default:
      console.warn(`Unknown recurrence type: ${habit.recurrence.type}`);
  }
};