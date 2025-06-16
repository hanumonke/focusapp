import * as Notifications from 'expo-notifications';
import { DayNumber, IReminder, timeToSeconds } from '@/db/types';



// First, set the handler that will cause the notification
// to show the alert
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const cancelNotificationsForItem = async (itemId: string) => {
  await Notifications.cancelScheduledNotificationAsync(itemId);
};

// ADD DAILY AND WEEKLY TYPES

export async function setReminder(reminder: IReminder) {
    
    const dateTimestamp = new Date(reminder.timestamp!);
    
    if (reminder.type == 'date') {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: reminder.title,
                body: reminder.message,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: dateTimestamp,
            },
        });
    } 

        if (reminder.type == 'interval' && reminder.unit && reminder.interval) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: reminder.title,
                    body: reminder.message,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: reminder.interval * timeToSeconds[reminder.unit]
                },
            });
        }


        if (reminder.type == 'daily') {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: reminder.title,
                    body: reminder.message,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: dateTimestamp.getHours(),
                    minute: dateTimestamp.getMinutes()
                },
            });
        }

        if (reminder.type == 'weekly' && reminder.day) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: reminder.title,
                    body: reminder.message,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday: DayNumber[reminder.day], 
                    hour: dateTimestamp.getHours(), 
                    minute: dateTimestamp.getMinutes()
                },
            });
        }

    }



