import * as Notifications from 'expo-notifications';
import { IReminder, timeToSeconds } from '@/db/types';

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

export async function setReminder(reminder: IReminder) {
    if (reminder.type == 'date' && reminder.timestamp) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: reminder.title,
                body: reminder.message,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(reminder.timestamp),
            },
        });
    } else {
        if (reminder.interval && reminder.unit) {
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

    }



}