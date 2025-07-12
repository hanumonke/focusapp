// notificationService.ts
import { loadHabits, loadSettings, loadTasks } from '@/db/storage';
import { IHabit, IReminder, timeToSeconds } from '@/db/types';
import * as Notifications from 'expo-notifications';

// --- CONFIGURACIÓN GLOBAL ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

// --- PERMISOS ---
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Notification permissions not granted');
  }
  return status === 'granted';
};

// --- CANCELAR NOTIFICACIONES POR ITEM ---
export const cancelNotificationsForItem = async (itemId: string) => {
  if (!itemId) {
    console.warn('Cannot cancel notifications - no itemId provided');
    return;
  }
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
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

// --- AGENDAR RECORDATORIOS PARA TAREAS ---
export const scheduleReminders = async (reminders: IReminder[], itemId: string) => {
  if (!itemId) {
    console.warn('Cannot schedule reminders - no itemId provided');
    return;
  }
  await cancelNotificationsForItem(itemId);
  for (const reminder of reminders) {
    try {
      await setSingleReminder(reminder, itemId);
      console.info("REMINDER SCHEDULED - SUCCESS");
    } catch (error) {
      console.error(`Failed to schedule reminder: ${reminder.message}`, error);
    }
  }
};

// --- AGENDAR UN SOLO RECORDATORIO ---
const setSingleReminder = async (reminder: IReminder, itemId: string) => {

  const settingsState = await loadSettings(); 
  

  if (!reminder.timestamp) {
    console.warn('Reminder has no timestamp, skipping');
    return;
  }
  if (!itemId) {
    console.warn('Cannot schedule reminder - no itemId provided');
    return;
  }

  const date = new Date(reminder.timestamp);
  const notificationId = `${itemId}-${reminder.id}`;
  const notificationContent = {
    title: reminder.title,
    body: reminder.message,
    data: { itemId, reminderId: reminder.id },
    sound: settingsState.defaultNotificationSound || 'default',
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
      if (!reminder.daysOfWeek || reminder.daysOfWeek.length === 0) {
        console.warn('Weekly reminder missing daysOfWeek');
        return;
      }
      for (const day of reminder.daysOfWeek) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${notificationId}-w${day}`,
          content: notificationContent,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1, // Expo: 1=Domingo
            hour: date.getHours(),
            minute: date.getMinutes(),
          },
        });
      }
      break;

    default:
      console.warn(`Unknown reminder type: ${reminder.type}`);
  }
};

// --- OBTENER TODAS LAS NOTIFICACIONES PROGRAMADAS (DEBUG) ---
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// --- AGENDAR RECORDATORIOS PARA HÁBITOS ---
export const scheduleHabitReminders = async (habit: IHabit) => {
  if (!habit.id) {
    console.warn('Cannot schedule habit reminders - no habit id');
    return;
  }
  if (!habit.recurrence || !habit.recurrence.time) {
    console.warn('Habit missing recurrence or time');
    return;
  }
  try {
    await cancelNotificationsForItem(habit.id);

    // Recordatorio puntual
    if (habit.reminderOnTime?.enabled) {
      await scheduleHabitSingleReminder(habit, 'onTime');
    }
    // Recordatorio antes
    if (habit.reminderBefore?.enabled && habit.reminderBefore.minutesBefore) {
      await scheduleHabitSingleReminder(habit, 'before');
    }

    console.log("HABIT REMINDER SUCCESSFULLY SCHEDULED");
  } catch (error) {
    console.error("Error scheduling habit reminders: ", error);
  }
};

const scheduleHabitSingleReminder = async (
  habit: IHabit,
  type: 'onTime' | 'before'
) => {

// SOUND
  const settingsState = await loadSettings();

  const [baseHour, baseMinute] = habit.recurrence.time.split(':').map(Number);
  let hour = baseHour;
  let minute = baseMinute;

  let message = '';
  if (type === 'onTime' && habit.reminderOnTime) {
    message = habit.reminderOnTime.message || `¡Es hora de tu hábito!`;
  }
  if (type === 'before' && habit.reminderBefore) {
    message = habit.reminderBefore.message || `¡Se acerca la hora de tu hábito!`;
    const mins = habit.reminderBefore.minutesBefore || 0;
    const totalMinutes = hour * 60 + minute - mins;
    hour = Math.floor(totalMinutes / 60);
    minute = totalMinutes % 60;
    if (hour < 0) hour = 0;
    if (minute < 0) minute = 0;
  }

  const content = {
    title: habit.title,
    body: message,
    sound: settingsState.defaultNotificationSound || 'default',
    data: { habitId: habit.id, type },
  };

  if (habit.recurrence.type === 'daily') {
    await Notifications.scheduleNotificationAsync({
      identifier: `${habit.id}-${type}-daily`,
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } else if (habit.recurrence.type === 'weekly' && habit.recurrence.daysOfWeek) {
    for (const day of habit.recurrence.daysOfWeek) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${habit.id}-${type}-w${day}`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour,
          minute,
        },
      });
    }
  }
};

export const rescheduleAllNotifications = async () => {
    console.log('Iniciando reprogramación de todas las notificaciones...');
    try {
        // 1. Cancelar ABSOLUTAMENTE todas las notificaciones programadas
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Todas las notificaciones existentes han sido canceladas.');

        // 2. Cargar todos los hábitos y reprogramarlos
        const habits = await loadHabits();
        console.log(`Reprogramando ${habits.length} hábitos...`);
        for (const habit of habits) {
            // scheduleHabitReminders ya se encarga de programar los recordatorios para cada hábito.
            await scheduleHabitReminders(habit); 
        }
        console.log('Reprogramación de hábitos completada.');

        // 3. Cargar todas las tareas y reprogramar sus recordatorios (si aplica)
        // Solo si tus tareas también usan el sonido por defecto y necesitan ser actualizadas.
        const tasks = await loadTasks(); 
        console.log(`Reprogramando ${tasks.length} tareas...`);
        for (const task of tasks) {
            if (task.reminders && task.reminders.length > 0) {
                // scheduleReminders ya se encarga de programar los recordatorios para cada tarea.
                await scheduleReminders(task.reminders, task.id);
            }
        }
        console.log('Reprogramación de tareas completada.');

        console.log('Todas las notificaciones han sido reprogramadas exitosamente con el nuevo sonido.');

    } catch (error) {
        console.error('Error al reprogramar todas las notificaciones:', error);
    }
};
