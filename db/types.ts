export enum timeToSeconds {
    MINUTE = 60,
    HOUR = 60 * MINUTE,
    DAY = 24 * HOUR, 
    WEEK = 7 + DAY
}

//TODO ADD REMINDER TYPES DAILY AND WEEKLY - ALMOST DONE

export type ReminderType = 'date' | 'interval' | 'daily' | 'weekly'; 
export type IntervalUnit = 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' ; 
export type Day = 'DOMINGO' | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO'; 
export enum DayNumber {
    DOMINGO = 1, 
    LUNES = 2, 
    MARTES = 3, 
    MIERCOLES = 4, 
    JUEVES = 5, 
    VIERNES = 6, 
    SABADO = 7
}
export interface IReminder {
    id: string
    type: ReminderType;
    interval?: number
    timestamp?: string; // ISO 8601 execution time -> to save either the whole date or the hour and minute for weekly and daily types
    unit?: IntervalUnit ;
    day?: Day,
    title: string; 
    message: string;
    sound: string; // Notification sound
}

export interface ITask {
    id: string;
    title: string;
    description: string; // Markdown
    dueDate: string | null; // ISO
    tags: string[];
    isCompleted: boolean;
    reminders: IReminder[];
    createdAt: string, 
    updatedAt: string
}

export type HabitRecurrenceType = "daily" | "weekly" | "custom"

export interface IHabitRecurrence {
    type: HabitRecurrenceType
    daysOfWeek?: number[]; // Solo si type === 'weekly'. Array de números (0=Domingo, 1=Lunes, ..., 6=Sábado)
    interval?: number; // Para 'custom', ej: 2 para "cada 2 días"
    unit?: 'day' | 'hour'; // Para 'custom', la unidad del intervalo
    time?: string
}


export interface IHabit {
    id: string;
    title: string;
    description: string; // Contenido Markdown
    tags: string[];
    recurrence: IHabitRecurrence | null;  // Define cuándo se "espera" que se realice el hábito
    // STREAK
    currentStreak: number; // Racha actual de días consecutivos completados
    bestStreak: number;    // Mejor racha histórica
    lastCompletedDate: string | null; // Fecha (ISO 8601, solo YYYY-MM-DD) de la última vez que se marcó como completado
    completionHistory: string[]; // Array de fechas (ISO 8601, solo YYYY-MM-DD) cuando el hábito fue completado
    createdAt: string; // Fecha de creación (ISO 8601)
    updatedAt: string; // Fecha de última actualización (ISO 8601)
}

export type IPendingItem = (ITask | IHabit) & {
    sortKey: string; // Para ordenar la lista (fecha/hora más próxima primero)
    itemType: 'task' | 'habit'; // Para saber qué tipo de ítem es al renderizarlo en la lista
    isDueToday?: boolean; // Para hábitos, indica si está debido hoy (útil para la interfaz)
};


// ESTADO GLOBAL


export interface IAppState {
    tasks: ITask[];   // Un array de todas tus tareas
    habits: IHabit[]; // Un array de todos tus hábitos
    settings: {       // Tus configuraciones de la app
        theme: 'light' | 'dark';
        enableNotifications: boolean;
        defaultNotificationSound: string;
    };
}

export const initialAppState: IAppState = {
    tasks: [],
    habits: [],
    settings: {
        theme: 'light',
        enableNotifications: true,
        defaultNotificationSound: 'default',
    },
};