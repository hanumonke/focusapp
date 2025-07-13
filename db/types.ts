// --- UTILS ---
export enum timeToSeconds {
    MINUTE = 60,
    HOUR = 60 * 60,
    DAY = 24 * 60 * 60,
    WEEK = 7 * 24 * 60 * 60
}

export type IntervalUnit = 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK';
export type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Domingo, 6=Sábado

// --- TASKS ---

export type ReminderType = 'date' | 'interval' | 'daily' | 'weekly';

export interface IReminder {
    id: string;
    type: ReminderType;
    timestamp?: string; // ISO 8601 (para 'date'), o solo hora/minuto para daily/weekly
    interval?: number; // Para 'interval'
    unit?: IntervalUnit; // Para 'interval'
    daysOfWeek?: DayNumber[]; // Para 'weekly'
    title: string;
    message: string;
    sound?: string;
}

// --- HABITS ---

export type HabitRecurrenceType = "daily" | "weekly";

export interface IHabitRecurrence {
    type: HabitRecurrenceType;
    daysOfWeek?: DayNumber[]; // Solo si type === 'weekly'
    time: string; // "HH:mm" formato 24h
}

// Simplificado: solo dos recordatorios posibles para hábitos
export interface IHabitReminderConfig {
    enabled: boolean;
    minutesBefore?: number; // Para "antes"
    snoozeMinutes?: number; // Repetir si no se marca como hecho
    message?: string;
}

export interface IHabit {
    id: string;
    title: string;
    description: string;
    tags: string[];
    recurrence: IHabitRecurrence;
    reminderOnTime: IHabitReminderConfig;   // Notificación puntual
    reminderBefore?: IHabitReminderConfig;  // Notificación antes (opcional)
    currentStreak: number;
    bestStreak: number;
    lastCompletedDate: string | null; // YYYY-MM-DD
    completionHistory: string[]; // YYYY-MM-DD[]
    createdAt: string;
    updatedAt: string;
}

// --- APP STATE (solo para tipado, no para guardar todo junto) ---

export interface ISettingsState {
    theme: 'light' | 'dark';
    enableNotifications: boolean;
    defaultNotificationSound: string;
    difficulty: {
        hard: number, medium: number, easy: number
    }
}

// Para separar en AsyncStorage:
export type TasksState = ITask[];
export type HabitsState = IHabit[];
export type SettingsState = ISettingsState;

// --- TASKS ---
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export const TaskDifficultySpa = {
    'easy': 'fácil', "medium": "medio", "hard": "difícil"
}

export interface ITask {
    id: string;
    title: string;
    description: string;
    dueDate: string | null; // ISO
    tags: string[];
    isCompleted: boolean;
    reminders: IReminder[];
    createdAt: string;
    updatedAt: string;
    difficulty: TaskDifficulty;
}